import asyncio
import logging
from datetime import datetime
from bson import ObjectId

from app.core.database import db
from app.services.blockchain_service import blockchain_service
from app.services.notification_service import notification_service

logger = logging.getLogger(__name__)


async def process_tip_verification(tip_id: str):
    """Process tip verification in background"""
    try:
        logger.info(f"Processing tip verification for tip_id: {tip_id}")

        if not ObjectId.is_valid(tip_id):
            logger.error(f"Invalid tip ID: {tip_id}")
            return False

        # LOCK TIP (avoid double processing)
        locked = await db.database.tips.update_one(
            {"_id": ObjectId(tip_id), "status": "pending"},
            {"$set": {"status": "processing", "updatedAt": datetime.utcnow()}}
        )

        # If already processing/confirmed/failed
        if locked.modified_count == 0:
            logger.info(f"Tip already being processed or done: {tip_id}")
            return True

        # Get tip from database
        tip = await db.database.tips.find_one({"_id": ObjectId(tip_id)})

        if not tip:
            logger.error(f"Tip not found: {tip_id}")
            return False

        # Verify transaction on blockchain
        verification_result = await blockchain_service.verify_tip_transaction(
            tx_hash=tip["txHash"],
            expected_from=tip["fromAddress"],
            expected_to=tip["toAddress"],
            expected_amount=tip["amount"]
        )

        if not verification_result["success"]:
            # Mark as failed
            await db.database.tips.update_one(
                {"_id": ObjectId(tip_id)},
                {"$set": {"status": "failed", "updatedAt": datetime.utcnow()}}
            )
            logger.error(f"Tip verification failed: {tip_id}, error: {verification_result.get('error')}")
            return False

        if not verification_result.get("verified", False):
            # Transaction exists but doesn't match our tip
            await db.database.tips.update_one(
                {"_id": ObjectId(tip_id)},
                {"$set": {"status": "failed", "updatedAt": datetime.utcnow()}}
            )
            logger.error(f"Tip verification mismatch: {tip_id}")
            return False

        # Tip verified successfully
        transaction = verification_result.get("transaction", {})
        transfer = verification_result.get("transfer", {})

        update_data = {
            "status": "confirmed",
            "blockNumber": transaction.get("blockNumber"),
            "confirmedAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        if transfer.get("token_address"):
            update_data["tokenAddress"] = transfer["token_address"]

        await db.database.tips.update_one(
            {"_id": ObjectId(tip_id)},
            {"$set": update_data}
        )

        # Update post tip statistics
        await update_post_tip_stats(tip["postId"], tip["amount"])

        # Update agent statistics (FIXED reputationScore increment)
        await update_agent_tip_stats(
            tip["fromAddress"],
            tip["toAddress"],
            tip["amount"]
        )

        # Create notification
        await notification_service.create_tip_notification(
            tip_id=tip_id,
            from_address=tip["fromAddress"],
            to_address=tip["toAddress"],
            amount=tip["amount"],
            post_id=tip["postId"],
            message=tip.get("message")
        )

        logger.info(f"Tip confirmed successfully: {tip_id}")
        return True

    except Exception as e:
        logger.error(f"Tip processing error for {tip_id}: {e}")

        # Mark as failed on error
        try:
            await db.database.tips.update_one(
                {"_id": ObjectId(tip_id)},
                {"$set": {"status": "failed", "updatedAt": datetime.utcnow()}}
            )
        except Exception as update_error:
            logger.error(f"Failed to mark tip as failed: {update_error}")

        return False


async def update_post_tip_stats(post_id: str, amount: float):
    """Update post tip statistics"""
    try:
        if not ObjectId.is_valid(post_id):
            logger.error(f"Invalid post ID for stats update: {post_id}")
            return

        result = await db.database.posts.update_one(
            {"_id": ObjectId(post_id)},
            {
                "$inc": {
                    "tipCount": 1,
                    "tipAmount": amount
                },
                "$set": {
                    "updatedAt": datetime.utcnow()
                }
            }
        )

        if result.modified_count > 0:
            logger.info(f"Updated post stats for post_id: {post_id}")
        else:
            logger.warning(f"Post not found for stats update: {post_id}")

    except Exception as e:
        logger.error(f"Post stats update error: {e}")


async def update_agent_tip_stats(from_address: str, to_address: str, amount: float):
    """Update agent tip statistics"""
    try:
        # Update sender stats
        await db.database.agents.update_one(
            {"walletAddress": from_address.lower()},
            {
                "$inc": {"totalTipsGiven": amount},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )

        # Update receiver stats (FIXED)
        await db.database.agents.update_one(
            {"walletAddress": to_address.lower()},
            {
                "$inc": {
                    "totalTipsReceived": amount,
                    "reputationScore": amount * 10
                },
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )

        logger.info(f"Updated agent stats: {from_address} -> {to_address} ({amount})")

    except Exception as e:
        logger.error(f"Agent stats update error: {e}")


async def process_pending_tips():
    """Process all pending tips"""
    try:
        logger.info("Processing all pending tips...")

        pending_tips = await db.database.tips.find(
            {"status": "pending"}
        ).sort("createdAt", 1).to_list(length=100)

        logger.info(f"Found {len(pending_tips)} pending tips to process")

        processed_count = 0
        failed_count = 0

        for tip in pending_tips:
            success = await process_tip_verification(str(tip["_id"]))

            if success:
                processed_count += 1
            else:
                failed_count += 1

            await asyncio.sleep(0.5)

        logger.info(f"Processed {processed_count} tips, {failed_count} failed")
        return processed_count

    except Exception as e:
        logger.error(f"Process pending tips error: {e}")
        return 0


async def scheduled_tip_processing():
    """Scheduled task for tip processing"""
    while True:
        try:
            await asyncio.sleep(300)  # every 5 min
            await process_pending_tips()

        except Exception as e:
            logger.error(f"Scheduled tip processing error: {e}")
            await asyncio.sleep(60)


if __name__ == "__main__":
    asyncio.run(process_pending_tips())

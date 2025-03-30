import express from "express";
import { pool } from "../config/db.js";

const msgRouter = express.Router();

msgRouter.post("/create", async (req, res) => {
  try {
    const { content } = req.body;
    const user_id = req.user.id;
    const { delivery_time } = req.body;

    if (!content || !delivery_time) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    if (
      isNaN(new Date(delivery_time)) ||
      new Date(delivery_time) < new Date()
    ) {
      return res
        .status(400)
        .json({ msg: "Delivery time cannot be in the past" });
    }

    const newMsg = await pool.query(
      "INSERT INTO messages (content, user_id, delivery_time) VALUES ($1, $2, $3) RETURNING *",
      [content, user_id, delivery_time]
    );
    res.status(201).json(newMsg.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

msgRouter.get("/", async (req, res) => {
  try {
    const user_id = req.user.id;
    await pool.query(
      "UPDATE messages SET status = $1 WHERE delivery_time < NOW() AND user_id = $2",
      ["delivered", user_id]
    );
    const messages = await pool.query(
      "SELECT * FROM messages where user_id = $1",
      [user_id]
    );
    res.status(200).json(messages.rows);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

msgRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    const { delivery_time } = req.body;

    const msgToBeUpdated = await pool.query(
      "SELECT * FROM messages WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (msgToBeUpdated.rows.length === 0) {
      return res.status(400).json({ msg: "Message not found" });
    }

    if (msgToBeUpdated.rows[0].status === "delivered") {
      return res.status(400).json({ msg: "Message already delivered" });
    }
    if (msgToBeUpdated.rows[0].status === "locked") {
      return res.status(400).json({ msg: "Message is locked" });
    }

    if (!content || !delivery_time) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    if (
      isNaN(new Date(delivery_time)) ||
      new Date(delivery_time) < new Date()
    ) {
      return res
        .status(400)
        .json({ msg: "Delivery time cannot be in the past" });
    }

    const deliveryTime = new Date(msgToBeUpdated.rows[0].delivery_time); //YYYY-MM-DDTHH:MM:SS.sssZ
    const creationTime = new Date(msgToBeUpdated.rows[0].created_at);
    const timeDiff = deliveryTime - creationTime;

    if (isNaN(deliveryTime) || isNaN(creationTime)) {
      return res
        .status(400)
        .json({ msg: "Invalid delivery time or creation time" });
    }

    const timeElapsed = new Date() - new Date(creationTime);
    if (timeDiff <= 0 && msgToBeUpdated.rows[0].status !== "delivered") {
      const status = "delivered";
      await pool.query(
        "UPDATE messages SET status = $1 WHERE id = $2 AND user_id = $3",
        [status, id, user_id]
      );
      return res.status(400).json({ msg: "Message already delivered" });
    } else if (
      timeElapsed > timeDiff * 0.1 &&
      msgToBeUpdated.rows[0].status !== "locked"
    ) {
      const status = "locked";
      await pool.query(
        "UPDATE messages SET status = $1 WHERE id = $2 AND user_id = $3",
        [status, id, user_id]
      );
      return res
        .status(400)
        .json({ msg: "Time limit exceeded, message can't be updated now" });
    }

    const updatedMsg = await pool.query(
      "UPDATE messages SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [content, id, user_id]
    );

    res.status(200).json(updatedMsg.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

msgRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const msgToBeDeleted = await pool.query(
      "SELECT * FROM messages WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (msgToBeDeleted.rows.length === 0) {
      return res.status(400).json({ msg: "Message not found" });
    }

    if (msgToBeDeleted.rows[0].status === "delivered") {
      return res.status(400).json({ msg: "Message already delivered" });
    }
    if (msgToBeDeleted.rows[0].status === "locked") {
      return res.status(400).json({ msg: "Message is locked" });
    }
    const deliveryTime = new Date(msgToBeDeleted.rows[0].delivery_time);
    const creationTime = new Date(msgToBeDeleted.rows[0].created_at);
    const timeDiff = deliveryTime - creationTime;

    if (isNaN(deliveryTime) || isNaN(creationTime)) {
      return res
        .status(400)
        .json({ msg: "Invalid delivery time or creation time" });
    }

    const timeElapsed = new Date() - new Date(creationTime);
    if (timeDiff <= 0 && msgToBeDeleted.rows[0].status !== "delivered") {
      const status = "delivered";
      await pool.query(
        "UPDATE messages SET status = $1 WHERE id = $2 AND user_id = $3",
        [status, id, user_id]
      );
      return res.status(400).json({ msg: "Message already delivered" });
    } else if (
      timeElapsed > timeDiff * 0.1 &&
      msgToBeDeleted.rows[0].status !== "locked"
    ) {
      const status = "locked";
      await pool.query(
        "UPDATE messages SET status = $1 WHERE id = $2 AND user_id = $3",
        [status, id, user_id]
      );
      return res
        .status(400)
        .json({ msg: "Time limit exceeded, message can't be updated now" });
    }
    await pool.query("DELETE FROM messages WHERE id = $1", [id]);
    res.status(200).json({ msg: "Message Deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

export default msgRouter;

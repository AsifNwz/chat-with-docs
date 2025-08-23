import pika
import json
import time
from file_parser import file_parser
from url_parser import url_parser


def callback(ch, method, properties, body):
    try:
        data = json.loads(body)

        if data["type"] == "file":
            fileName = data["path"].split("/")[-1]
            file_parser(fileName)
            print("📂 File processed:", fileName)
            response = {"file": fileName, "status": "done"}

        elif data["type"] == "url":
            url = data["url"]
            print("🌐 URL received:", url)
            md_file = url_parser(url)
            print("🌐 URL processed:", url)
            response = {"file": md_file, "status": "done"}

        else:
            raise ValueError(f"Unknown task type: {data['type']}")

        # send response
        ch.basic_publish(
            exchange="",
            routing_key=properties.reply_to,
            properties=pika.BasicProperties(
                correlation_id=properties.correlation_id,
                delivery_mode=2  # persistent message
            ),
            body=json.dumps(response)
        )
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print(f"❌ Error processing message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


print("🚀 Worker starting up...")

while True:
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                # host="localhost",  
                host="rabbitmq",  
                heartbeat=3600,
                blocked_connection_timeout=3600
            )
        )
        print("✅ Connected to RabbitMQ")
        break
    except pika.exceptions.AMQPConnectionError:
        print("⏳ RabbitMQ not ready, retrying in 5s...")
        time.sleep(5)

channel = connection.channel()
channel.queue_declare(queue="file-queue", durable=True)

print("⚡ Listening for messages...")
channel.basic_consume(queue="file-queue", on_message_callback=callback, auto_ack=False)
channel.start_consuming()

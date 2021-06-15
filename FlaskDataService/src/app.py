import eventlet
import json
from flask import Flask, render_template
from flask_cors import CORS
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
from flask_bootstrap import Bootstrap
from parser import read_pcd

eventlet.monkey_patch()

app = Flask(__name__)
CORS(app)
app.config['SECRET'] = 'testor key'
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['MQTT_BROKER_URL'] = 'ncar-im-0.rc.unr.edu'
app.config['MQTT_BROKER_PORT'] = 30041
#app.config['MQTT_BROKER_PORT'] = 1883
app.config['MQTT_USERNAME'] = ''
app.config['MQTT_PASSWORD'] = ''
app.config['MQTT_KEEPALIVE'] = 30
app.config['MQTT_TLS_ENABLED'] = False
app.config['MQTT_CLEAN_SESSION'] = True

# Parameters for SSL enabled
# app.config['MQTT_BROKER_PORT'] = 8883
# app.config['MQTT_TLS_ENABLED'] = True
# app.config['MQTT_TLS_INSECURE'] = True
# app.config['MQTT_TLS_CA_CERTS'] = 'ca.crt'

mqtt = Mqtt(app)
socketio = SocketIO(app, cors_allowed_origins="*")
bootstrap = Bootstrap(app)


@app.route('/')
def index():
#    return "Hello world!"
    return render_template('index.html')


#@socketio.on('publish')
#def handle_publish(json_str):
#    data = json.loads(json_str)
#    mqtt.publish(data['topic'], data['message'])

@mqtt.on_connect()
def handle_connect(client, userdata, flags, rc):
    mqtt.subscribe('test15thVirginiaSE')
    mqtt.subscribe('test15thVirginiaNW')
    mqtt.subscribe('test2')

@socketio.on('subscribe')
def handle_subscribe(json_str):
    data = json.loads(json_str)
    mqtt.subscribe(data['topic'])
    print("Data ", data)


#@socketio.on('unsubscribe_all')
#def handle_unsubscribe_all():
#    mqtt.unsubscribe_all()


@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    data = dict(
        topic=message.topic,
        payload=message.payload
    )
    values = read_pcd(message.payload)
    data['payload'] = values['points']
    data['time'] = values['time']
    socketio.emit('mqtt_message', data=data) # can emit on topic name, can grab info from the topic


@mqtt.on_log()
def handle_logging(client, userdata, level, buf):
    print(level, buf)


if __name__ == '__main__':
    # Keep reloader set to false otherwise this will create two Flask instances.
    socketio.run(app, host='0.0.0.0', port=5000, use_reloader=False, debug=False)
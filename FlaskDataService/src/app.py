import eventlet
import json
import gzip
import time
import datetime
import threading
import zstd
from flask import Flask, render_template, Response
from flask_cors import CORS
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
from flask_bootstrap import Bootstrap
from multiprocessing import Queue
from parser import read_pcd

eventlet.monkey_patch()
lock = threading.Lock()
threadedData = []
def process_message():
    global lock
    while True:
        print("hello world")
        # print(threadedData.empty())
        lock.acquire()
        print("LENGTH!!!!! " + str(len(threadedData)))
        if len(threadedData) > 0:
            print("hello world 2")
            data = threadedData[0]
            del threadedData[0]
            lock.release()
            # data = threadedData.get()
            values = read_pcd( data['payload'])
            start = datetime.datetime.now()
            # data['payload'] = gzip.compress(bytes(values['points'], 'utf-8'))
            data['payload'] = zstd.compress(bytes(values['points'], 'utf-8'))
            stop = (datetime.datetime.now()-start).total_seconds()
            print(stop)
            # data['payload'] = bytes(values['points'])
            data['objects'] = values['objects']
            data['time'] = values['time']

            socketio.emit('mqtt_message', data=data) # can emit on topic name, can grab info from the topic
        else:
            print('test')
            lock.release()
        time.sleep(.1)

    
app = Flask(__name__)
CORS(app)
x = threading.Thread(target=process_message, daemon=True)
x.start()
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

# Create Dictionary to store and track fps information from the data stream
fpsDict = {}

countDict = {}

# threadedData = []
# lock = threading.Lock()

mqttFirstFrame = False
startTime = datetime.datetime.now()

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

@app.route('/topics')
def findTopics():
    #topicsAvailable = str(topicsAvailable)
    return Response(json.dumps(topicsAvailable), mimetype='text/json')
    #return 'Hello'

def count_fps_datamesh(timeValue, topicValue):
    global mqttFirstFrame, startTime
    duration = 0
    if topicValue in countDict:
        countDict[topicValue] += 1
    if not mqttFirstFrame:
        mqttFirstFrame = True
        startTime = datetime.datetime.now()
    else:
        duration = (datetime.datetime.now() - startTime).total_seconds()
    if timeValue <= duration:
        #startTime = datetime.datetime.now()
        fpsDict[topicValue] = countDict[topicValue] / duration
        #countDict[topicValue] = 0
        print(fpsDict)


#@socketio.on('publish')
#def handle_publish(json_str):
#    data = json.loads(json_str)
#    mqtt.publish(data['topic'], data['message'])

@mqtt.on_connect()
def handle_connect(client, userdata, flags, rc):
    mqtt.subscribe('test15thVirginiaSE')
    mqtt.subscribe('test15thVirginiaNW')
    # mqtt.subscribe('test2')

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
    count_fps_datamesh(10, message.topic)

    # if not threadedData.full():
    # threadedData.put(data)
    lock.acquire()
    # print(len(threadedData))
    if len(threadedData) < 100:
        threadedData.append(data)
        print('whatever')
    lock.release()
    # values = read_pcd(message.payload)
    #data['payload'] = gzip.compress(bytes(values['points'], 'utf-8'))
    #data['payload'] = bytes(values['points'])
    #data['time'] = values['time']
    #socketio.emit('mqtt_message', data=data) # can emit on topic name, can grab info from the topic

# def process_message():
#     while True:
#         lock.acquire()
#         #print("hello world")
#         if len(threadedData) > 0:
#             print("hello world 2")
#             data = threadedData[0]
#             del threadedData[0]
#             lock.release()
#             # data = threadedData.get()
#             # values = read_pcd( data['payload'])
#             # data['payload'] = gzip.compress(bytes(values['points'], 'utf-8'))
#             # data['payload'] = bytes(values['points'])
#             # data['time'] = values['time']
#             # socketio.emit('mqtt_message', data=data) # can emit on topic name, can grab info from the topic
#         else:
#             lock.release()


@mqtt.on_log()
def handle_logging(client, userdata, level, buf):
    print(level, buf)


if __name__ == '__main__':
    # Open Topic File and Read in available topics
    topicFile = open('./topic.txt', 'r')
    topicsAvailable = topicFile.read().split('\n')
    for line in topicsAvailable:
        fpsDict[line] = 0
        countDict[line] = 0
    topicFile.close()



    # Keep reloader set to false otherwise this will create two Flask instances.
    socketio.run(app, host='0.0.0.0', port=5000, use_reloader=False, debug=False)

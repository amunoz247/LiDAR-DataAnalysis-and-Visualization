# ----------------------------------------------------------------------------------------
#
#   Flask Backend Main Program
#
#   Authors: Andrew Munoz, Chase Carthen
#   Date: 06/15/2021
#   Purpose: Takes in LiDAR point cloud data being streamed from sensors
#            and passes the data to parser.py. Once the data has been parsed,
#            it is then passed up to the Angular front end web server to be
#            analyzed through data visualization graphs.
#
# ----------------------------------------------------------------------------------------

import sys
import eventlet
import json
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

# Declare app object and set it to Flask class
app = Flask(__name__)
CORS(app)

# Declare threading variables
eventlet.monkey_patch()
lock = threading.Lock()
threadedData = []

"""Function that processes mqtt message and compresses the message.
Message is threaded and passed into read_pcd function to be parsed
and cleaned. Passes cleaned data to data[]."""
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
            data['payload'] = zstd.compress(bytes(values['points'], 'utf-8'))
            stop = (datetime.datetime.now()-start).total_seconds()
            print(stop)
            data['objects'] = values['objects']
            data['time'] = values['time']

            # Emits message data and can grab info from the topic
            socketio.emit('mqtt_message', data=data)

        else:
            print('test')
            lock.release()
        time.sleep(.1)

    
# Threading constructor object
x = threading.Thread(target=process_message, daemon=True)
x.start()

# App configuration for Flask-MQTT
app.config['SECRET'] = 'testor key'
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['MQTT_BROKER_URL'] = 'ncar-im-0.rc.unr.edu'
app.config['MQTT_BROKER_PORT'] = 30041
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

# Create Dictionary to store and track fps information from the data stream
fpsDict = {}
countDict = {}

# Variables to check first frame/message and start timer
mqttFirstFrame = False
startTime = datetime.datetime.now()

mqtt = Mqtt(app)
socketio = SocketIO(app, cors_allowed_origins="*")
bootstrap = Bootstrap(app)

# Main app page
@app.route('/')
def index():
    return render_template('index.html')

# App page that returns list of topics found in topic.txt
@app.route('/topics')
def findTopics():
    return Response(json.dumps(topicsAvailable), mimetype='text/json')

""" Function that counts fps of the sensor stream.
Parameters (timeValue: int, topicValue: string)
topicValue should be topic string obtained from mqtt message."""
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


# MQTT decorator function to handle connection to broker
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

#@socketio.on('publish')
#def handle_publish(json_str):
#    data = json.loads(json_str)
#    mqtt.publish(data['topic'], data['message'])

#@socketio.on('unsubscribe_all')
#def handle_unsubscribe_all():
#    mqtt.unsubscribe_all()

# MQTT decorator function to handle all the messages that have been subscribed
@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    data = dict(
        topic=message.topic,
        payload=message.payload
    )

    # Counts the fps of the data stream
    count_fps_datamesh(10, message.topic)

    lock.acquire()
    if len(threadedData) < 100:
        threadedData.append(data)
        print('whatever')
    lock.release()
 
# MQTT function that handles MQTT logging functionality   
@mqtt.on_log()
def handle_logging(client, userdata, level, buf):
    print(level, buf)

# Main function
if __name__ == '__main__':
    # Open Topic File and Read in available topics
    topicFile = open('./topic.txt', 'r')
    topicsAvailable = topicFile.read().split('\n')

    # Loops through lines in text file and adds values to dictionary
    for line in topicsAvailable:
        fpsDict[line] = 0
        countDict[line] = 0
    topicFile.close()

    # Keep reloader set to false otherwise this will create two Flask instances.
    socketio.run(app, host='0.0.0.0', port=5000, use_reloader=False, debug=False)

    # try:
    #     while True:
    #         pass      
    # except (KeyboardInterrupt, SystemExit):
    #     print('Program was Interrupted through Manual Input. Exiting Program ...')
    #     sys.exit(0)

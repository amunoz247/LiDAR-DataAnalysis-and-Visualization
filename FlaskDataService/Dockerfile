FROM python
EXPOSE 5000
RUN apt update
RUN apt install -y dumb-init
RUN mkdir dataservice
COPY src /dataservice/
WORKDIR /dataservice
RUN pip install -r requirements.txt
ENTRYPOINT [ "dumb-init" ]

CMD [ "python","app.py" ]

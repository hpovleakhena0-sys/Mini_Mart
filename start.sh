#!/bin/bash
cd BackEnd
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn BackEnd.wsgi:application --bind 0.0.0.0:$PORT
#!/bin/bash
cd Backend
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn Backend.wsgi:application --bind 0.0.0.0:$PORT
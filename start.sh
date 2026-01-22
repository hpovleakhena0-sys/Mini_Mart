#!/bin/bash
python Backend/manage.py migrate
python Backend/manage.py collectstatic --noinput
gunicorn Backend.wsgi:application --bind 0.0.0.0:$PORT
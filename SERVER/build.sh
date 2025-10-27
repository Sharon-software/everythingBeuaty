set -o errexit

pip install -r SERVER/requirements.txt
python SERVER/manage.py collectstatic --noinput 
python SERVER/manage.py migrate

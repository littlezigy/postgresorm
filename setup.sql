CREATE DATABASE pgorm_dev_db;

CREATE USER postgresuser with password 'passworddd';
GRANT ALL PRIVILEGES ON DATABASE pgorm_dev_db TO postgresuser;
GRANT CREATE ON DATABASE pgorm_dev_db TO postgresuser;



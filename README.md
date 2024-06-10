# Retrieve Logs REST API

I've mostly tried to approach this project as I would approach a prcatical working POC. I tried to reach an MVP and have the core functionalities and performance. The following is the list of improvements that could be done in the next iternations:

- Use of design patterns and improving modularity of the code
- Increasing test covarage and adding integration tests as well
- Reducing/Investigating possible security risks
- Maybe a caching mechanisem (probably based on file edit time)
- Better keyword/txt search regex
- Providing swagger file
- Adding a linter
- Configuring a CI/CD
- Better dockerfile

## How to run the code

### Docker
If you have `docker` and `docker compose` installed on your machine. By running the following command the code will run in a docker container on you machine. 

Note: make sure port `3000` isn't already aquired by any other process. 

```bash
docker compose up
```

Note: for easy testing for this assignment I'm using `./sample_log_dir` as a default log file path. 

Then you can run a simple curl to check the content of sample log files in `./sample_log_dir`:
```bash
curl http://localhost:3000/logs/\?f\=log1.log
```

Other query param options that you can use:
`c`: For limiting the number of lines of log
`s`: For showing only the logs that contains this specific keyword
And example would be like: 
```bash
curl http://localhost:3000/logs/\?f\=log1.log\&c\=6\&s\=line1
```
Which will show maximum of 6 line log that contains `line1` in it. 


### Without Docker
If you don't have docker on your machine. You need to have `node` installed and then you need to install dependecies.
```bash
npm install 
```
and then run the code with 
```bash
export LOG_DIR=./sample_log_dir && node index.js
```
Note: using `./sample_log_dir` is for ease of use. You can replace it with `/var/log` if you want to test it more realisticly. Be aware that in this case your `f` parameter in url queries will be the path/name of log files inside `/var/log` 

### ab Benchmark
Following is an `ab` benchmark for a file with 230,464 lines. 
```bash
ab -n 1000 -c 50 http://localhost:3000/logs/\?f\=install.log
This is ApacheBench, Version 2.3 <$Revision: 1903618 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 100 requests
Completed 200 requests
Completed 300 requests
Completed 400 requests
Completed 500 requests
Completed 600 requests
Completed 700 requests
Completed 800 requests
Completed 900 requests
Completed 1000 requests
Finished 1000 requests


Server Software:        
Server Hostname:        localhost
Server Port:            3000

Document Path:          /logs/?f=install.log
Document Length:        1085 bytes

Concurrency Level:      50
Time taken for tests:   0.109 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      1183000 bytes
HTML transferred:       1085000 bytes
Requests per second:    9133.67 [#/sec] (mean)
Time per request:       5.474 [ms] (mean)
Time per request:       0.109 [ms] (mean, across all concurrent requests)
Transfer rate:          10551.89 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    1   0.9      0       3
Processing:     2    5   1.6      5      11
Waiting:        1    4   1.2      5      11
Total:          3    5   1.5      5      12
WARNING: The median and mean for the initial connection time are not within a normal deviation
        These results are probably not that reliable.

Percentage of the requests served within a certain time (ms)
  50%      5
  66%      5
  75%      5
  80%      5
  90%      7
  95%     11
  98%     11
  99%     11
 100%     12 (longest request)
```
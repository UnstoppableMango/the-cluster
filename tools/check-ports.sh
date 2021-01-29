#!/bin/bash

# 8472 should be UDP
nmap kube.int.unmango.net -p 2379-2380,6443,8472,9345,10250
nmap rancher.int.unmango.net -p 80,443

# rook-ceph cluster

## Measurements

- The log collector is a logrotate loop that measures 0 on every ceph pod.
  At the chart's 100m and 100Mi, it reserved roughly four cores and 3Gi across the 33 OSDs and the mons, mgr, mds and rgw.
- apollo has 31.2 GiB of RAM, against gaea's 504 and zeus's 126, and runs eight OSDs: six 14 TB drives and two NVMe.
  At the chart's 4Gi default OSD request, eight OSDs ask for 33 GiB, and the third never schedules.
  At 3Gi they request 24 GiB, against about 25.3 GiB left after the CSI plugins and the other daemons.
  With apollo's former CI role, only 11.2 GiB was allocatable and no request size fit.

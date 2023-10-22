cert_sans = [
  "192.168.1.101",
]
node_data = {
  controlplanes = {
    "192.168.1.101" = {
      install_disk = "/dev/mmcblk0"
      hostname     = "rqctrl1"
    }
  }
  workers = {}
}

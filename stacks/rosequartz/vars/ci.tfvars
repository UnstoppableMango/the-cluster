public_ip = "10.5.0.2"
cert_sans = [
  "10.5.0.2",
]
node_data = {
  controlplanes = {
    "10.5.0.2" = {
      install_disk = "/dev/mmcblk0"
      hostname     = "rqctrl1"
    }
  }
  workers = {}
}

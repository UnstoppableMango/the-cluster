cluster_endpoint = "https://man.thecluster.io:6443"
cert_sans = [
    "192.168.1.101",
    "man.thecluster.io",
]
node_data = {
    controlplanes = {
        "192.168.1.101" = {
            install_disk = "/dev/mmcblk0"
            hostname = "rqctrl1"
        }
    }
    workers = {}
}

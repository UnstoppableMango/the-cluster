cluster_endpoint = "https://man.thecluster.io:6443"
cert_sans = [
    "192.168.1.101",
    "man.thecluster.io",
]
node_data = {
    controlplanes = {
        "man.thecluster.io" = {
            install_disk = "/dev/mmcblk0"
            hostname = "rqctrl1"
        }
    }
    workers = {}
}

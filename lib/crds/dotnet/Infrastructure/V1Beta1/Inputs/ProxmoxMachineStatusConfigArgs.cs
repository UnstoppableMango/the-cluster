// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1
{

    /// <summary>
    /// Configuration
    /// </summary>
    public class ProxmoxMachineStatusConfigArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Enable/disable ACPI.
        /// </summary>
        [Input("acpi")]
        public Input<int>? Acpi { get; set; }

        /// <summary>
        /// List of host cores used to execute guest processes, for example: 0,5,8-11
        /// </summary>
        [Input("affinity")]
        public Input<string>? Affinity { get; set; }

        /// <summary>
        /// Enable/disable communication with the QEMU Guest Agent and its properties.
        /// </summary>
        [Input("agent")]
        public Input<string>? Agent { get; set; }

        /// <summary>
        /// Virtual processor architecture. Defaults to the host.
        /// </summary>
        [Input("arch")]
        public Input<string>? Arch { get; set; }

        /// <summary>
        /// Arbitrary arguments passed to kvm, for example: args: -no-reboot -no-hpet NOTE: this option is for experts only.
        /// </summary>
        [Input("args")]
        public Input<string>? Args { get; set; }

        /// <summary>
        /// Configure a audio device, useful in combination with QXL/Spice.
        /// </summary>
        [Input("audio0")]
        public Input<string>? Audio0 { get; set; }

        /// <summary>
        /// Automatic restart after crash (currently ignored).
        /// </summary>
        [Input("autostart")]
        public Input<int>? Autostart { get; set; }

        /// <summary>
        /// Amount of target RAM for the VM in MiB. Using zero disables the ballon driver.
        /// </summary>
        [Input("balloon")]
        public Input<int>? Balloon { get; set; }

        /// <summary>
        /// Select BIOS implementation.
        /// </summary>
        [Input("bios")]
        public Input<string>? Bios { get; set; }

        /// <summary>
        /// boot order. ";" separated. : 'order=device1;device2;device3'
        /// </summary>
        [Input("boot")]
        public Input<string>? Boot { get; set; }

        /// <summary>
        /// This is an alias for option -ide2
        /// </summary>
        [Input("cdrom")]
        public Input<string>? Cdrom { get; set; }

        /// <summary>
        /// cloud-init: Specify custom files to replace the automatically generated ones at start.
        /// </summary>
        [Input("cicustom")]
        public Input<string>? Cicustom { get; set; }

        /// <summary>
        /// cloud-init: Password to assign the user. Using this is generally not recommended. Use ssh keys instead. Also note that older cloud-init versions do not support hashed passwords.
        /// </summary>
        [Input("cipassword")]
        public Input<string>? Cipassword { get; set; }

        /// <summary>
        /// Specifies the cloud-init configuration format. The default depends on the configured operating system type (`ostype`. We use the `nocloud` format for Linux, and `configdrive2` for windows.
        /// </summary>
        [Input("citype")]
        public Input<string>? Citype { get; set; }

        /// <summary>
        /// cloud-init: User name to change ssh keys and password for instead of the image's configured default user.
        /// </summary>
        [Input("ciuser")]
        public Input<string>? Ciuser { get; set; }

        /// <summary>
        /// The number of cores per socket. : 1 ~
        /// </summary>
        [Input("cores")]
        public Input<int>? Cores { get; set; }

        /// <summary>
        /// emulated cpu type
        /// </summary>
        [Input("cpu")]
        public Input<string>? Cpu { get; set; }

        /// <summary>
        /// Limit of CPU usage. NOTE: If the computer has 2 CPUs, it has total of '2' CPU time. Value '0' indicates no CPU limit.
        /// </summary>
        [Input("cpulimit")]
        public Input<int>? Cpulimit { get; set; }

        /// <summary>
        /// CPU weight for a VM. Argument is used in the kernel fair scheduler. The larger the number is, the more CPU time this VM gets. Number is relative to weights of all the other running VMs.
        /// </summary>
        [Input("cpuunits")]
        public Input<int>? Cpuunits { get; set; }

        [Input("description")]
        public Input<string>? Description { get; set; }

        [Input("efidisk0")]
        public Input<int>? Efidisk0 { get; set; }

        [Input("freeze")]
        public Input<int>? Freeze { get; set; }

        [Input("hookscript")]
        public Input<string>? Hookscript { get; set; }

        [Input("hostpci0")]
        public Input<string>? Hostpci0 { get; set; }

        [Input("hostpci1")]
        public Input<string>? Hostpci1 { get; set; }

        [Input("hostpci2")]
        public Input<string>? Hostpci2 { get; set; }

        [Input("hostpci3")]
        public Input<string>? Hostpci3 { get; set; }

        [Input("hotplug")]
        public Input<string>? Hotplug { get; set; }

        [Input("hugepages")]
        public Input<string>? Hugepages { get; set; }

        [Input("ide0")]
        public Input<string>? Ide0 { get; set; }

        [Input("ide1")]
        public Input<string>? Ide1 { get; set; }

        [Input("ide2")]
        public Input<string>? Ide2 { get; set; }

        [Input("ide3")]
        public Input<string>? Ide3 { get; set; }

        [Input("ipconfig0")]
        public Input<string>? Ipconfig0 { get; set; }

        [Input("ipconfig1")]
        public Input<string>? Ipconfig1 { get; set; }

        [Input("ipconfig10")]
        public Input<string>? Ipconfig10 { get; set; }

        [Input("ipconfig11")]
        public Input<string>? Ipconfig11 { get; set; }

        [Input("ipconfig12")]
        public Input<string>? Ipconfig12 { get; set; }

        [Input("ipconfig13")]
        public Input<string>? Ipconfig13 { get; set; }

        [Input("ipconfig14")]
        public Input<string>? Ipconfig14 { get; set; }

        [Input("ipconfig15")]
        public Input<string>? Ipconfig15 { get; set; }

        [Input("ipconfig16")]
        public Input<string>? Ipconfig16 { get; set; }

        [Input("ipconfig17")]
        public Input<string>? Ipconfig17 { get; set; }

        [Input("ipconfig18")]
        public Input<string>? Ipconfig18 { get; set; }

        [Input("ipconfig19")]
        public Input<string>? Ipconfig19 { get; set; }

        [Input("ipconfig2")]
        public Input<string>? Ipconfig2 { get; set; }

        [Input("ipconfig20")]
        public Input<string>? Ipconfig20 { get; set; }

        [Input("ipconfig21")]
        public Input<string>? Ipconfig21 { get; set; }

        [Input("ipconfig22")]
        public Input<string>? Ipconfig22 { get; set; }

        [Input("ipconfig23")]
        public Input<string>? Ipconfig23 { get; set; }

        [Input("ipconfig24")]
        public Input<string>? Ipconfig24 { get; set; }

        [Input("ipconfig25")]
        public Input<string>? Ipconfig25 { get; set; }

        [Input("ipconfig26")]
        public Input<string>? Ipconfig26 { get; set; }

        [Input("ipconfig27")]
        public Input<string>? Ipconfig27 { get; set; }

        [Input("ipconfig28")]
        public Input<string>? Ipconfig28 { get; set; }

        [Input("ipconfig29")]
        public Input<string>? Ipconfig29 { get; set; }

        [Input("ipconfig3")]
        public Input<string>? Ipconfig3 { get; set; }

        [Input("ipconfig30")]
        public Input<string>? Ipconfig30 { get; set; }

        [Input("ipconfig31")]
        public Input<string>? Ipconfig31 { get; set; }

        [Input("ipconfig4")]
        public Input<string>? Ipconfig4 { get; set; }

        [Input("ipconfig5")]
        public Input<string>? Ipconfig5 { get; set; }

        [Input("ipconfig6")]
        public Input<string>? Ipconfig6 { get; set; }

        [Input("ipconfig7")]
        public Input<string>? Ipconfig7 { get; set; }

        [Input("ipconfig8")]
        public Input<string>? Ipconfig8 { get; set; }

        [Input("ipconfig9")]
        public Input<string>? Ipconfig9 { get; set; }

        [Input("ivshmem")]
        public Input<string>? Ivshmem { get; set; }

        [Input("keephugepages")]
        public Input<int>? Keephugepages { get; set; }

        [Input("keyboard")]
        public Input<string>? Keyboard { get; set; }

        /// <summary>
        /// enable/disable KVM hardware virtualization
        /// </summary>
        [Input("kvm")]
        public Input<int>? Kvm { get; set; }

        [Input("localtime")]
        public Input<int>? Localtime { get; set; }

        [Input("lock")]
        public Input<string>? Lock { get; set; }

        /// <summary>
        /// specifies the QEMU machine type
        /// </summary>
        [Input("machine")]
        public Input<string>? Machine { get; set; }

        /// <summary>
        /// amount of RAM for the VM in MiB : 16 ~
        /// </summary>
        [Input("memory")]
        public Input<int>? Memory { get; set; }

        /// <summary>
        /// A Number represents a JSON number literal.
        /// </summary>
        [Input("migrate_downtime")]
        public Input<string>? Migrate_downtime { get; set; }

        [Input("migrate_speed")]
        public Input<int>? Migrate_speed { get; set; }

        /// <summary>
        /// name for VM. Only used on the configuration web interface
        /// </summary>
        [Input("name")]
        public Input<string>? Name { get; set; }

        /// <summary>
        /// cloud-init: Sets DNS server IP address for a container. Create will automatically use the setting from the host if neither searchdomain nor nameserver are set.
        /// </summary>
        [Input("nameserver")]
        public Input<string>? Nameserver { get; set; }

        [Input("net0")]
        public Input<string>? Net0 { get; set; }

        [Input("net1")]
        public Input<string>? Net1 { get; set; }

        [Input("net10")]
        public Input<string>? Net10 { get; set; }

        [Input("net11")]
        public Input<string>? Net11 { get; set; }

        [Input("net12")]
        public Input<string>? Net12 { get; set; }

        [Input("net13")]
        public Input<string>? Net13 { get; set; }

        [Input("net14")]
        public Input<string>? Net14 { get; set; }

        [Input("net15")]
        public Input<string>? Net15 { get; set; }

        [Input("net16")]
        public Input<string>? Net16 { get; set; }

        [Input("net17")]
        public Input<string>? Net17 { get; set; }

        [Input("net18")]
        public Input<string>? Net18 { get; set; }

        [Input("net19")]
        public Input<string>? Net19 { get; set; }

        [Input("net2")]
        public Input<string>? Net2 { get; set; }

        [Input("net20")]
        public Input<string>? Net20 { get; set; }

        [Input("net21")]
        public Input<string>? Net21 { get; set; }

        [Input("net22")]
        public Input<string>? Net22 { get; set; }

        [Input("net23")]
        public Input<string>? Net23 { get; set; }

        [Input("net24")]
        public Input<string>? Net24 { get; set; }

        [Input("net25")]
        public Input<string>? Net25 { get; set; }

        [Input("net26")]
        public Input<string>? Net26 { get; set; }

        [Input("net27")]
        public Input<string>? Net27 { get; set; }

        [Input("net28")]
        public Input<string>? Net28 { get; set; }

        [Input("net29")]
        public Input<string>? Net29 { get; set; }

        [Input("net3")]
        public Input<string>? Net3 { get; set; }

        [Input("net30")]
        public Input<string>? Net30 { get; set; }

        [Input("net31")]
        public Input<string>? Net31 { get; set; }

        [Input("net4")]
        public Input<string>? Net4 { get; set; }

        [Input("net5")]
        public Input<string>? Net5 { get; set; }

        [Input("net6")]
        public Input<string>? Net6 { get; set; }

        [Input("net7")]
        public Input<string>? Net7 { get; set; }

        [Input("net8")]
        public Input<string>? Net8 { get; set; }

        [Input("net9")]
        public Input<string>? Net9 { get; set; }

        [Input("numa")]
        public Input<int>? Numa { get; set; }

        [Input("numa0")]
        public Input<string>? Numa0 { get; set; }

        [Input("numa1")]
        public Input<string>? Numa1 { get; set; }

        [Input("numa2")]
        public Input<string>? Numa2 { get; set; }

        [Input("numa3")]
        public Input<string>? Numa3 { get; set; }

        [Input("numa4")]
        public Input<string>? Numa4 { get; set; }

        [Input("numa5")]
        public Input<string>? Numa5 { get; set; }

        [Input("numa6")]
        public Input<string>? Numa6 { get; set; }

        [Input("numa7")]
        public Input<string>? Numa7 { get; set; }

        /// <summary>
        /// specifies whether a VM will be started during system bootup
        /// </summary>
        [Input("onboot")]
        public Input<int>? Onboot { get; set; }

        /// <summary>
        /// quest OS
        /// </summary>
        [Input("ostype")]
        public Input<string>? Ostype { get; set; }

        [Input("parallel0")]
        public Input<string>? Parallel0 { get; set; }

        [Input("parallel1")]
        public Input<string>? Parallel1 { get; set; }

        [Input("parallel2")]
        public Input<string>? Parallel2 { get; set; }

        [Input("protection")]
        public Input<int>? Protection { get; set; }

        /// <summary>
        /// Allow reboot. if set to '0' the VM exit on reboot
        /// </summary>
        [Input("reboot")]
        public Input<int>? Reboot { get; set; }

        [Input("rng0")]
        public Input<string>? Rng0 { get; set; }

        [Input("sata0")]
        public Input<string>? Sata0 { get; set; }

        [Input("sata1")]
        public Input<string>? Sata1 { get; set; }

        [Input("sata2")]
        public Input<string>? Sata2 { get; set; }

        [Input("sata3")]
        public Input<string>? Sata3 { get; set; }

        [Input("sata4")]
        public Input<string>? Sata4 { get; set; }

        [Input("sata5")]
        public Input<string>? Sata5 { get; set; }

        [Input("scsi0")]
        public Input<string>? Scsi0 { get; set; }

        [Input("scsi1")]
        public Input<string>? Scsi1 { get; set; }

        [Input("scsi10")]
        public Input<string>? Scsi10 { get; set; }

        [Input("scsi11")]
        public Input<string>? Scsi11 { get; set; }

        [Input("scsi12")]
        public Input<string>? Scsi12 { get; set; }

        [Input("scsi13")]
        public Input<string>? Scsi13 { get; set; }

        [Input("scsi14")]
        public Input<string>? Scsi14 { get; set; }

        [Input("scsi15")]
        public Input<string>? Scsi15 { get; set; }

        [Input("scsi16")]
        public Input<string>? Scsi16 { get; set; }

        [Input("scsi17")]
        public Input<string>? Scsi17 { get; set; }

        [Input("scsi18")]
        public Input<string>? Scsi18 { get; set; }

        [Input("scsi19")]
        public Input<string>? Scsi19 { get; set; }

        [Input("scsi2")]
        public Input<string>? Scsi2 { get; set; }

        [Input("scsi20")]
        public Input<string>? Scsi20 { get; set; }

        [Input("scsi21")]
        public Input<string>? Scsi21 { get; set; }

        [Input("scsi22")]
        public Input<string>? Scsi22 { get; set; }

        [Input("scsi23")]
        public Input<string>? Scsi23 { get; set; }

        [Input("scsi24")]
        public Input<string>? Scsi24 { get; set; }

        [Input("scsi25")]
        public Input<string>? Scsi25 { get; set; }

        [Input("scsi26")]
        public Input<string>? Scsi26 { get; set; }

        [Input("scsi27")]
        public Input<string>? Scsi27 { get; set; }

        [Input("scsi28")]
        public Input<string>? Scsi28 { get; set; }

        [Input("scsi29")]
        public Input<string>? Scsi29 { get; set; }

        [Input("scsi3")]
        public Input<string>? Scsi3 { get; set; }

        [Input("scsi30")]
        public Input<string>? Scsi30 { get; set; }

        [Input("scsi4")]
        public Input<string>? Scsi4 { get; set; }

        [Input("scsi5")]
        public Input<string>? Scsi5 { get; set; }

        [Input("scsi6")]
        public Input<string>? Scsi6 { get; set; }

        [Input("scsi7")]
        public Input<string>? Scsi7 { get; set; }

        [Input("scsi8")]
        public Input<string>? Scsi8 { get; set; }

        [Input("scsi9")]
        public Input<string>? Scsi9 { get; set; }

        /// <summary>
        /// SCSI controller model
        /// </summary>
        [Input("scsihw")]
        public Input<string>? Scsihw { get; set; }

        /// <summary>
        /// cloud-init: Sets DNS search domains for a container. Create will automatically use the setting from the host if neither searchdomain nor nameserver are set.
        /// </summary>
        [Input("searchdomain")]
        public Input<string>? Searchdomain { get; set; }

        [Input("serial0")]
        public Input<string>? Serial0 { get; set; }

        [Input("serial1")]
        public Input<string>? Serial1 { get; set; }

        [Input("serial2")]
        public Input<string>? Serial2 { get; set; }

        [Input("serial3")]
        public Input<string>? Serial3 { get; set; }

        [Input("shares")]
        public Input<int>? Shares { get; set; }

        [Input("smbios1")]
        public Input<string>? Smbios1 { get; set; }

        [Input("smp")]
        public Input<int>? Smp { get; set; }

        /// <summary>
        /// number of sockets
        /// </summary>
        [Input("sockets")]
        public Input<int>? Sockets { get; set; }

        [Input("spice_enhancements")]
        public Input<string>? Spice_enhancements { get; set; }

        /// <summary>
        /// cloud-init setup public ssh keys (one key per line, OpenSSH format)
        /// </summary>
        [Input("sshkeys")]
        public Input<string>? Sshkeys { get; set; }

        [Input("startdate")]
        public Input<string>? Startdate { get; set; }

        [Input("startup")]
        public Input<int>? Startup { get; set; }

        [Input("tablet")]
        public Input<int>? Tablet { get; set; }

        /// <summary>
        /// tags of the VM. only for meta information
        /// </summary>
        [Input("tags")]
        public Input<string>? Tags { get; set; }

        [Input("tdf")]
        public Input<int>? Tdf { get; set; }

        /// <summary>
        /// enable/disable template
        /// </summary>
        [Input("template")]
        public Input<int>? Template { get; set; }

        [Input("tpmstate")]
        public Input<string>? Tpmstate { get; set; }

        [Input("unused0")]
        public Input<string>? Unused0 { get; set; }

        [Input("unused1")]
        public Input<string>? Unused1 { get; set; }

        [Input("unused2")]
        public Input<string>? Unused2 { get; set; }

        [Input("unused3")]
        public Input<string>? Unused3 { get; set; }

        [Input("unused4")]
        public Input<string>? Unused4 { get; set; }

        [Input("unused5")]
        public Input<string>? Unused5 { get; set; }

        [Input("unused6")]
        public Input<string>? Unused6 { get; set; }

        [Input("unused7")]
        public Input<string>? Unused7 { get; set; }

        [Input("vcpus")]
        public Input<int>? Vcpus { get; set; }

        [Input("vga")]
        public Input<string>? Vga { get; set; }

        [Input("virtio0")]
        public Input<string>? Virtio0 { get; set; }

        [Input("virtio1")]
        public Input<string>? Virtio1 { get; set; }

        [Input("virtio10")]
        public Input<string>? Virtio10 { get; set; }

        [Input("virtio11")]
        public Input<string>? Virtio11 { get; set; }

        [Input("virtio12")]
        public Input<string>? Virtio12 { get; set; }

        [Input("virtio13")]
        public Input<string>? Virtio13 { get; set; }

        [Input("virtio14")]
        public Input<string>? Virtio14 { get; set; }

        [Input("virtio15")]
        public Input<string>? Virtio15 { get; set; }

        [Input("virtio2")]
        public Input<string>? Virtio2 { get; set; }

        [Input("virtio3")]
        public Input<string>? Virtio3 { get; set; }

        [Input("virtio4")]
        public Input<string>? Virtio4 { get; set; }

        [Input("virtio5")]
        public Input<string>? Virtio5 { get; set; }

        [Input("virtio6")]
        public Input<string>? Virtio6 { get; set; }

        [Input("virtio7")]
        public Input<string>? Virtio7 { get; set; }

        [Input("virtio8")]
        public Input<string>? Virtio8 { get; set; }

        [Input("virtio9")]
        public Input<string>? Virtio9 { get; set; }

        [Input("vmgenid")]
        public Input<string>? Vmgenid { get; set; }

        [Input("vmstatestorage")]
        public Input<string>? Vmstatestorage { get; set; }

        [Input("watchdog")]
        public Input<string>? Watchdog { get; set; }

        public ProxmoxMachineStatusConfigArgs()
        {
        }
        public static new ProxmoxMachineStatusConfigArgs Empty => new ProxmoxMachineStatusConfigArgs();
    }
}
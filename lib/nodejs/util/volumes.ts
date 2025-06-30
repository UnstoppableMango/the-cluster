import { Input, Output, output } from '@pulumi/pulumi';

export interface CsiCertificateArgs {
	driver?: Input<string>;
	// https://cert-manager.io/docs/usage/csi-driver/#supported-volume-attributes
	issuer: Input<string>;
	issuerKind?: Input<'Issuer' | 'ClusterIssuer'>;
	issuerGroup?: Input<string>;
	commonName?: Input<string>;
	dnsNames?: Input<Input<string>[]>;
	ipSans?: Input<Input<string>[]>;
	uriSans?: Input<Input<string>[]>;
	duration?: Input<string>;
	isCa?: Input<boolean>;
	keyUsages?: Input<Input<string>[]>;
	keyEncoding?: Input<'PKCS1' | 'PKCS8'>;
	certificateFile?: Input<string>;
	caFile?: Input<string>;
	privateKeyFile?: Input<string>;
	fsGroup?: Input<number>;
	renewBefore?: Input<string>;
	reusePrivateKey?: Input<boolean>;
	pkcs12Enable?: Input<boolean>;
	pkcs12FileName?: Input<string>;
	pkcs12Password?: Input<string>;
}

export interface Volume {
	name: string;
	csi: {
		readOnly: boolean;
		driver: string;
		volumeAttributes: Record<string, string | undefined>;
	};
}

export function certificate(name: string, args: CsiCertificateArgs): Output<Volume> {
	return output(args).apply((a) => {
		const volumeAttributes: Record<string, string | undefined> = {
			'csi.cert-manager.io/issuer-name': a.issuer,
			'csi.cert-manager.io/issuer-kind': a.issuerKind,
			'csi.cert-manager.io/issuer-group': a.issuerGroup,
			'csi.cert-manager.io/common-name': a.commonName,
			'csi.cert-manager.io/dns-names': a.dnsNames?.join(','),
			'csi.cert-manager.io/ip-sans': a.ipSans?.join(','),
			'csi.cert-manager.io/uri-sans': a.uriSans?.join(','),
			'csi.cert-manager.io/duration': a.duration,
			'csi.cert-manager.io/is-ca': a.isCa !== undefined ? `${a.isCa}` : undefined,
			'csi.cert-manager.io/key-usages': a.keyUsages?.join(','),
			'csi.cert-manager.io/key-encoding': a.keyEncoding,
			'csi.cert-manager.io/certificate-file': a.certificateFile,
			'csi.cert-manager.io/ca-file': a.caFile,
			'csi.cert-manager.io/privatekey-file': a.privateKeyFile,
			'csi.cert-manager.io/fs-group': a.fsGroup?.toString(),
			'csi.cert-manager.io/renew-before': a.renewBefore,
			'csi.cert-manager.io/reuse-private-key': a.reusePrivateKey !== undefined ? `${a.reusePrivateKey}` : undefined,
			'csi.cert-manager.io/pkcs12-enable': a.pkcs12Enable !== undefined ? `${a.pkcs12Enable}` : undefined,
			'csi.cert-manager.io/pkcs12-filename': a.pkcs12FileName,
			'csi.cert-manager.io/pkcs12-password': a.pkcs12Password,
		};

		const driver = a.driver ?? 'csi.cert-manager.io';
		const csi = { driver, volumeAttributes, readOnly: true };
		return { name, csi };
	});
}

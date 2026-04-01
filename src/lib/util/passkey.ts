import { WebAuthn } from '@darkedges/capacitor-native-webauthn';
import type {
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/types';

export async function checkPasskeySupport(): Promise<boolean> {
	try {
		const { value } = await WebAuthn.isWebAuthnAvailable();
		return value;
	} catch {
		return false;
	}
}

export async function registerPasskey(options: {
	challenge: string;
	userId: string;
	userName: string;
	displayName: string;
}) {
	const creationOptions: PublicKeyCredentialCreationOptionsJSON = {
		challenge: options.challenge,
		rp: {
			id: 'localhost',
			name: 'Kokoro Health (Local Dev)'
		},
		user: {
			id: btoa(options.userId),
			name: options.userName,
			displayName: options.displayName
		},
		pubKeyCredParams: [
			{ type: 'public-key', alg: -7 },
			{ type: 'public-key', alg: -257 }
		],
		authenticatorSelection: {
			authenticatorAttachment: 'platform',
			residentKey: 'required',
			userVerification: 'required'
		},
		attestation: 'none'
	};

	return await WebAuthn.startRegistration(creationOptions);
}

export async function authenticateWithPasskey(challenge: string) {
	const requestOptions: PublicKeyCredentialRequestOptionsJSON = {
		challenge,
		rpId: 'localhost',
		userVerification: 'required'
	};

	return await WebAuthn.startAuthentication(requestOptions);
}

export async function checkPasskeySupport(): Promise<boolean> {
	try {
		const value = true;
		return value;
	} catch {
		return false;
	}
}

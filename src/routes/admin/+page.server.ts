export async function load({ locals }) {
	if (!locals.user || !locals.user.moderator) {
		return {
			status: 302,
			redirect: '/'
		};
	}
}

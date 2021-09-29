import type Client from './structures/Client';

const spotifyClientCredentialsGrant = async (client: Client) => {
	try {
		const { body } = await client.spotify.clientCredentialsGrant();
		client.logger.info(`The Spotify API access token was succesfully retrieved, It will expire in ${body['expires_in']}`);
		client.spotify.setAccessToken(body['access_token']);
	} catch (error) {
		client.logger.error(`Something went wrong when retrieving the Spotify API access token:`, error);
	}
};

export { spotifyClientCredentialsGrant };

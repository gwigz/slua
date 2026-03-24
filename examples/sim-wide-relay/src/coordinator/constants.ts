export const NOTECARD_NAME = "settings.yml"

/** Note, these are defaults, use the `settings.yml` notecard to override them */
export const config = {
  PRIVATE_CHANNEL: -1731704569,
  SIGN_NONCE: -1977872753,
  SIGN_WINDOW: 2,
  IGNORED_AVATARS: [] as string[],
  MAX_BLOCKS: 10,
  LISTENER_OBJECT: "Relay Listener",
  WELCOME_MESSAGE:
    "You're now connected to a sim-wide chat relay, your chat will be relayed to everyone in the region." +
    ' [{help} Click here] for a list of chat commands, or type "!help".',
  POLL_INTERVAL: 3,
  POOL_BUFFER: 10,
  POOL_BUFFER_MAX: 20,
  REZ_BATCH_SIZE: 20,
}

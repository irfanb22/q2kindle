import Foundation

enum KeychainHelper {
    private static let suiteName = "group.com.makegoodthings.q2kindle"
    private static let tokenKey = "supabase_access_token"

    static func save(token: String) -> Bool {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return false }
        defaults.set(token, forKey: tokenKey)
        return defaults.synchronize()
    }

    static func loadToken() -> String? {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return nil }
        return defaults.string(forKey: tokenKey)
    }

    static func deleteToken() {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return }
        defaults.removeObject(forKey: tokenKey)
    }
}

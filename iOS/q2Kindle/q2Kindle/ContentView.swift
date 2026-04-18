import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        WebView()
            .ignoresSafeArea()
    }
}

struct WebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true

        if let url = URL(string: "https://q2kindle.com") {
            webView.load(URLRequest(url: url))
        }

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            extractAndStoreToken(from: webView)
        }

        private func extractAndStoreToken(from webView: WKWebView) {
            let cookieStore = webView.configuration.websiteDataStore.httpCookieStore
            cookieStore.getAllCookies { cookies in
                // Find sb-*-auth-token cookies (may be chunked: .0, .1, etc.)
                let authCookies = cookies.filter {
                    $0.name.hasPrefix("sb-") && $0.name.contains("-auth-token")
                }.sorted { $0.name < $1.name }

                guard !authCookies.isEmpty else { return }

                var combinedValue = authCookies.map { $0.value }.joined()

                // Supabase SSR uses "base64-" prefix on cookie values
                if combinedValue.hasPrefix("base64-") {
                    combinedValue = String(combinedValue.dropFirst("base64-".count))
                }

                // Decode base64 (handle URL-safe base64 + missing padding)
                var base64 = combinedValue
                    .replacingOccurrences(of: "-", with: "+")
                    .replacingOccurrences(of: "_", with: "/")
                let remainder = base64.count % 4
                if remainder > 0 {
                    base64.append(String(repeating: "=", count: 4 - remainder))
                }

                guard let data = Data(base64Encoded: base64),
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let accessToken = json["access_token"] as? String,
                      !accessToken.isEmpty else {
                    print("[q2Kindle] Failed to parse token from cookie")
                    return
                }

                let saved = KeychainHelper.save(token: accessToken)
                print("[q2Kindle] Token saved to shared keychain: \(saved)")
            }
        }
    }
}

#Preview {
    ContentView()
}

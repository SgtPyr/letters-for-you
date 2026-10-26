import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        NotebookWebView()
            .ignoresSafeArea(edges: .bottom)
            .preferredColorScheme(.light)
    }
}

struct NotebookWebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        let webView = WKWebView(
            frame: .zero,
            configuration: configuration
        )

        webView.backgroundColor = UIColor.systemBackground
        webView.isOpaque = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        if let url = URL(
            string: "https://sgtpyr.github.io/letters-for-you/"
        ) {
            webView.load(URLRequest(url: url))
        }

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
    }
}

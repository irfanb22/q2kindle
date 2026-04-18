import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    private let statusLabel: UILabel = {
        let label = UILabel()
        label.text = "Saving to q2Kindle..."
        label.textAlignment = .center
        label.font = .systemFont(ofSize: 17, weight: .medium)
        label.textColor = .label
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private let activityIndicator: UIActivityIndicatorView = {
        let indicator = UIActivityIndicatorView(style: .medium)
        indicator.translatesAutoresizingMaskIntoConstraints = false
        indicator.startAnimating()
        return indicator
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        handleSharedURL()
    }

    private func setupUI() {
        view.backgroundColor = .systemBackground

        let stack = UIStackView(arrangedSubviews: [activityIndicator, statusLabel])
        stack.axis = .vertical
        stack.spacing = 12
        stack.alignment = .center
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            stack.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 32),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -32)
        ])
    }

    private func handleSharedURL() {
        guard let token = KeychainHelper.loadToken() else {
            showResult(message: "Please open q2Kindle and log in first", success: false)
            return
        }

        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            showResult(message: "No content to share", success: false)
            return
        }

        for item in extensionItems {
            guard let attachments = item.attachments else { continue }
            for provider in attachments {
                if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] item, error in
                        DispatchQueue.main.async {
                            if let url = item as? URL {
                                self?.sendURL(url.absoluteString, token: token)
                            } else if let urlData = item as? Data, let url = URL(dataRepresentation: urlData, relativeTo: nil) {
                                self?.sendURL(url.absoluteString, token: token)
                            } else {
                                self?.showResult(message: "Could not read URL", success: false)
                            }
                        }
                    }
                    return
                }
            }
        }

        showResult(message: "No URL found", success: false)
    }

    private func sendURL(_ urlString: String, token: String) {
        guard let apiURL = URL(string: "https://q2kindle.com/api/articles/extract") else {
            showResult(message: "Invalid API URL", success: false)
            return
        }

        var request = URLRequest(url: apiURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 30

        let body: [String: String] = ["url": urlString]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    self?.showResult(message: "Error: \(error.localizedDescription)", success: false)
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse else {
                    self?.showResult(message: "No response from server", success: false)
                    return
                }

                if httpResponse.statusCode == 200 || httpResponse.statusCode == 201 {
                    self?.showResult(message: "Added to your queue!", success: true)
                } else if httpResponse.statusCode == 401 {
                    self?.showResult(message: "Session expired. Open q2Kindle to log in again.", success: false)
                } else {
                    self?.showResult(message: "Failed (HTTP \(httpResponse.statusCode))", success: false)
                }
            }
        }.resume()
    }

    private func showResult(message: String, success: Bool) {
        activityIndicator.stopAnimating()
        statusLabel.text = message
        statusLabel.textColor = success ? .systemGreen : .systemRed

        DispatchQueue.main.asyncAfter(deadline: .now() + (success ? 1.5 : 2.5)) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: nil)
        }
    }
}

// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MFlixSwiftUI",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "MFlixSwiftUI",
            targets: ["MFlixSwiftUI"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/getditto/DittoSwiftPackage", from: "4.10.0")
    ],
    targets: [
        .target(
            name: "MFlixSwiftUI",
            dependencies: [
                .product(name: "DittoSwift", package: "DittoSwiftPackage")
            ]
        )
    ]
)
import java.util.Properties

// Load the shared Ditto development credentials from the repository root
// `.env` file (see the root README). Missing values stay empty and the app
// shows a configuration error screen instead of crashing.
val repoRoot = rootDir.parentFile
val envProps = Properties().apply {
    val envFile = repoRoot.resolve(".env").takeIf { it.exists() }
        ?: repoRoot.resolve(".env.template").takeIf { it.exists() }
    envFile?.inputStream()?.use { load(it) }
}

fun envValue(key: String): String =
    envProps.getProperty(key)
        ?.trim()
        ?.trim('"', '\'')
        ?: System.getenv(key)
        ?: ""

fun String.toBuildConfigLiteral(): String =
    "\"" + replace("\\", "\\\\").replace("\"", "\\\"") + "\""

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "live.ditto.mflix"
    compileSdk = 37

    defaultConfig {
        applicationId = "live.ditto.mflix"
        minSdk = 26 // ditto-tools-android requires API 26; the Ditto SDK itself supports 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        buildConfigField(
            "String",
            "DITTO_DATABASE_ID",
            envValue("DITTO_DATABASE_ID").toBuildConfigLiteral()
        )
        buildConfigField(
            "String",
            "DITTO_DEVELOPMENT_TOKEN",
            envValue("DITTO_DEVELOPMENT_TOKEN").toBuildConfigLiteral()
        )
        buildConfigField(
            "String",
            "DITTO_SERVER_URL",
            envValue("DITTO_SERVER_URL").toBuildConfigLiteral()
        )
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.tooling.preview)
    debugImplementation(libs.androidx.compose.ui.tooling)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Adaptive: navigation suite (bottom bar on phones, nav rail on tablets)
    // and the Navigation 3 list-detail scene strategy.
    implementation(libs.androidx.material3.adaptive.navigation.suite)
    implementation(libs.androidx.material3.adaptive.navigation3)
    implementation(libs.androidx.navigation3.runtime)
    implementation(libs.androidx.navigation3.ui)

    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    // Ditto SDK v5 + diagnostic tools
    implementation(libs.ditto.kotlin)
    implementation(libs.ditto.tools.android)

    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
}

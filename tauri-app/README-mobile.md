# Bottles — app mobile (Tauri)

POC d'app mobile Tauri v2. Le code natif (Rust) est **partagé entre Android et iOS** :
il n'y a rien à réécrire pour passer de l'un à l'autre.

## Build automatique (GitHub Actions)

Le workflow [`.github/workflows/mobile-build.yml`](../.github/workflows/mobile-build.yml)
compile à chaque push (sur `main` ou la branche mobile), ou manuellement via
l'onglet **Actions → Build mobile apps → Run workflow**.

Résultats téléchargeables dans **Actions → (le run) → Artifacts** :

| Plateforme | Artifact | Installable ? |
|-----------|----------|---------------|
| Android | `bottles-android-apk` | ✅ APK debug signé, s'installe direct (Diawi, lien, adb…) |
| iOS | `bottles-ios-ipa` | ✅ seulement si les secrets Apple sont configurés (voir plus bas) |

### Débloquer l'IPA iOS installable

Le runner macOS de GitHub compile iOS sans Mac local. Mais pour produire un
`.ipa` **installable sur iPhone**, Apple exige une signature. Ajoute ce secret
dans **Settings → Secrets and variables → Actions** du repo :

- `APPLE_TEAM_ID` — le *Team ID* de ton compte Apple Developer (99 $/an)

Sans ce secret, le job iOS se contente de **compiler pour le simulateur**
(preuve que ça build), sans générer d'IPA installable.

## Build en local (Windows = Android uniquement)

iOS est **impossible depuis Windows** (nécessite macOS + Xcode).

```bash
cd tauri-app
npm install

# Desktop (test rapide de l'UI)
npm run tauri dev

# Android (nécessite : JDK 17, Android SDK + NDK, Mode développeur Windows activé)
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/<version>"
npm run tauri android init
npm run tauri android build --apk --debug   # APK installable
```

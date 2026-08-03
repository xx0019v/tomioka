# 正式URLとGitHub Pagesの配信構成監査

確認日: 2026-08-03

## 現在の構成

| 配信先 | 実測した構成 | リポジトリとの接続 |
| --- | --- | --- |
| `https://mayu-no-chizu.cid-ac.com/` | DNS Aレコードは`202.233.67.57`。JPNIC WHOISのネットワーク名は`XSERVER`、組織は`XSERVER Inc.`。nginxから単一HTML主体の旧サイトを配信 | 本リポジトリ内にXserver向けデプロイ設定なし。GitHub Actionsのsecret/variable、ローカルのFTP/SFTP/SSH設定もなし |
| `https://xx0019v.github.io/tomioka/` | GitHub Pagesのlegacy build。公開元は`gh-pages`ブランチ直下 | 本リポジトリの`out/`を手動同期 |

正式URLのHTMLは`Last-Modified: Tue, 21 Jul 2026 03:18:17 GMT`で、GitHub Pagesの最新版とは別内容である。GitHub Pages APIの`cname`は`null`であり、正式URLはGitHub Pagesのカスタムドメインとして設定されていない。

## 正式URLへ現在のビルドを反映する場合

XSERVERを維持する場合は、次が必要となる。

1. 対象サブドメインのドキュメントルートを確認できるXServerアカウント
2. サーバーパネル、FTP、SFTP、またはSSHのいずれかのアップロード権限
3. `NEXT_PUBLIC_BASE_PATH`を空にし、`NEXT_PUBLIC_SITE_URL=https://mayu-no-chizu.cid-ac.com/`として正式URLルート用に再ビルド
4. 現在の公開ファイルを退避後、`out/`の内容とドットファイルをドキュメントルートへ同期
5. `/`、`/map/`、`/information/`、`/_next/`資産、`sitemap.xml`、OGPを正式URLで再検証

資格情報がない状態で公開ディレクトリや接続先を推測してアップロードしない。

## 今後の統一方針

推奨は、正式URLをGitHub Pagesのカスタムドメインにして公開元を一つにする方法である。実施にはGitHub Pages設定の管理権限と、XServer DNSで`mayu-no-chizu.cid-ac.com`のCNAMEを変更する権限が必要となる。カスタムドメイン運用ではサイトがドメイン直下になるため、GitHub Pages向けビルドも`NEXT_PUBLIC_BASE_PATH`を空にして再検証する。

XSERVERを継続する場合は、GitHub ActionsからXSERVERへ静的出力を同期する専用ワークフローと、接続資格情報をRepository Secretsへ登録し、GitHub Pagesを確認用と位置付ける。いずれの場合も、同じコミットから正式URLと確認URLへ別々の内容が出ない構成にする。

## canonicalが正式URLを向く現状の注意

GitHub PagesのcanonicalとOGP URLは正式URLを示している一方、正式URLが旧内容のため、検索エンジンには最新版GitHub Pagesが旧ページの重複版として扱われ、最新版のタイトルや本文が正規ページとして評価されない可能性がある。SNSや共有リンクも正式URLの旧内容へ到達する。担当教員から指定された正式URLは変更せず、正式URLの更新または配信元統一を優先する。

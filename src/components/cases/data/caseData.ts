
// Import the MailCase type
import { MailCase } from '../email/types';

// 案件のサンプルデータ（案件詳細を追加）
export const caseData: MailCase[] = [
  {
    id: "c744bb81-c4f5-4550-bdc3-5dd217e81f68",
    title: "Java開発エンジニア",
    skills: ["Java", "Spring Boot", "SQL"],
    location: "東京（リモート可）",
    budget: "60~80万円",
    status: "募集中",
    source: "mail",
    company: "テクノソリューション株式会社",
    receivedDate: "2025-05-10T09:30:00",
    sender: "tanaka@technosolution.co.jp",
    senderName: "田中 一郎",
    senderEmail: "tanaka@technosolution.co.jp",
    senders: [
      {
        name: "田中 一郎",
        email: "tanaka@technosolution.co.jp",
        position: "営業担当"
      },
      {
        name: "佐藤 太郎",
        email: "sato@technosolution.co.jp",
        position: "PM"
      }
    ],
    createdAt: "2025-05-10",
    startDate: "2025-07-01",
    keyTechnologies: "Java, SpringBoot, AWS",
    foreignerAccepted: true,
    freelancerAccepted: false,
    registrationType: "自動（メール）",
    desiredBudget: "70万円",
    detailDescription: `
金融系システムの新規開発プロジェクトにおけるJavaエンジニアの募集案件です。

【業務内容】
- 既存金融システムのリプレイスプロジェクト
- 要件定義からテストまでの一連の開発作業
- チームでの協業によるアジャイル開発

【必要スキル・経験】
- Java開発の経験3年以上
- Spring Bootを用いた開発経験
- データベース（Oracle、PostgreSQL等）の設計・実装経験
- Git等のバージョン管理システムの使用経験

【歓迎スキル】
- クラウド環境（特にAWS）での開発経験
- マイクロサービスアーキテクチャの経験
- CI/CDパイプラインの構築・運用経験

【プロジェクト概要】
- プロジェクト期間：2025年7月〜2026年3月（予定）
- 開発環境：Java 17, Spring Boot 3.x, PostgreSQL, AWS
- チーム構成：PM 1名、PL 1名、エンジニア 5名

【その他条件】
- 週3回のオンサイト勤務（場所：東京都千代田区）
- リモートワーク併用可能
- 稼働時間：140〜180時間/月
- 単価：スキル・経験に応じて60〜80万円
- 面談：2回（オンライン可）

【案件の魅力】
最新の技術スタックを使った大規模リプレイスプロジェクトで、技術的な成長が見込めます。また、アジャイル開発を取り入れており、短いサイクルでの成果を実感できる環境です。チームメンバーも経験豊富なエンジニアが多く、知識の共有が活発に行われています。
    `,
    experience: "3年以上",
    workType: "週3回オンサイト/リモート併用可",
    duration: "2025年7月〜2026年3月（予定）",
    japanese: "ビジネスレベル",
    priority: "高",
    manager: "佐藤 太郎",
    managerEmail: "sato@technosolution.co.jp",
    processes: ["要件定義", "基本設計", "詳細設計", "製造"],
    interviewCount: "2",
    description: "金融系システムの新規開発プロジェクトにおけるJavaエンジニアの募集案件です。既存システムのリプレイス案件となります。"
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    title: "フロントエンドエンジニア",
    skills: ["React", "TypeScript", "Next.js"],
    location: "大阪",
    budget: "55~70万円",
    status: "募集中",
    source: "manual",
    company: "デジタルフロンティア株式会社",
    receivedDate: "2025-05-15T13:45:00",
    sender: "yoshida@digital-frontier.co.jp",
    senderName: "吉田 健太",
    senderEmail: "yoshida@digital-frontier.co.jp",
    senders: [
      {
        name: "吉田 健太",
        email: "yoshida@digital-frontier.co.jp",
        position: "技術部長"
      }
    ],
    createdAt: "2025-05-10",
    keyTechnologies: "React, TypeScript, Next.js",
    registrationType: "手動",
    startDate: "2025-06-15",
    experience: "2年以上",
    workType: "オンサイト（リモート勤務は要相談）",
    duration: "3ヶ月〜（延長の可能性あり）",
    japanese: "ビジネス会話レベル",
    priority: "中",
    manager: "山田 隆",
    managerEmail: "yamada@digital-frontier.co.jp",
    foreignerAccepted: true,
    freelancerAccepted: true,
    processes: ["基本設計", "詳細設計", "製造", "単体テスト"],
    interviewCount: "1",
    detailDescription: `
ECサイトのフロントエンド開発を担当するエンジニアを募集しています。

【業務内容】
- ECサイトのフロントエンド開発
- 既存機能の改善・新機能の追加
- パフォーマンスチューニング
- コードレビュー

【必要スキル・経験】
- React、TypeScriptでの開発経験2年以上
- GitHubを用いたバージョン管理の経験
- レスポンシブデザインの実装経験

【歓迎スキル】
- Next.jsでの開発経験
- GraphQLの使用経験
- CIツールの使用経験
- パフォーマンス最適化の経験

【開発環境】
- 言語：TypeScript
- フレームワーク：React、Next.js
- 状態管理：Redux Toolkit
- スタイリング：Tailwind CSS
- その他：Storybook、Jest

【その他条件】
- 稼働時間：160〜180時間/月
- 単価：55〜70万円（スキル見合い）
- 勤務地：大阪市内（リモート勤務は要相談）
- 面談回数：1〜2回
`,
    description: "ECサイトのフロントエンド開発を担当するエンジニアを募集しています。主にReactとTypeScriptを使用した開発となります。"
  },
  {
    id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    title: "インフラエンジニア",
    skills: ["AWS", "Docker", "Kubernetes"],
    location: "名古屋",
    budget: "65~90万円",
    status: "選考中",
    source: "mail",
    company: "クラウドテック株式会社",
    receivedDate: "2025-05-08T14:15:00",
    sender: "suzuki@cloudtech.jp",
    senderName: "鈴木 次郎",
    senderEmail: "suzuki@cloudtech.jp",
    senders: [
      {
        name: "鈴木 次郎",
        email: "suzuki@cloudtech.jp",
        position: "インフラ部門マネージャー"
      },
      {
        name: "伊藤 浩",
        email: "ito@cloudtech.jp",
        position: "採用担当"
      }
    ],
    createdAt: "2025-05-08",
    keyTechnologies: "AWS, Docker, Kubernetes",
    registrationType: "自動（メール）",
    startDate: "2025-07-01",
    foreignerAccepted: true,
    freelancerAccepted: true,
    manager: "中村 誠",
    managerEmail: "nakamura@cloudtech.jp",
    experience: "4年以上",
    workType: "週2回オンサイト/リモート併用可",
    duration: "6ヶ月〜12ヶ月",
    japanese: "日常会話レベル",
    priority: "高",
    processes: ["設計", "構築", "運用"],
    interviewCount: "2",
    detailDescription: `
クラウドインフラの設計・構築・運用を担当するインフラエンジニアを募集しています。

【業務内容】
- AWS環境の設計・構築・運用
- Kubernetes/Dockerを用いたコンテナ環境の構築
- CI/CDパイプラインの整備
- インフラ監視の仕組み構築

【必要スキル】
- AWSの各種サービスの設計・構築経験
- Docker/Kubernetesの実務経験
- Terraform等のIaCツールの使用経験
- Linux/UNIXサーバー運用経験

【歓迎スキル】
- AWS認定資格保持者
- セキュリティ対策の知識・経験
- マイクロサービスアーキテクチャの理解
- 大規模システム運用経験

【勤務条件】
- 週2日オンサイト（名古屋市内）、残りはリモート勤務
- 単価：スキル・経験により65~90万円
- 稼働時間：140~180時間/月
- 参画期間：6ヶ月～（延長の可能性あり）
`,
    description: "クラウドインフラの設計・構築・運用を担当するエンジニアを募集しています。AWSとKubernetesを中心とした環境です。"
  },
  {
    id: "d4e5f6a7-b8c9-0123-cdef-456789abcdef",
    title: "データサイエンティスト",
    skills: ["Python", "機械学習", "統計解析"],
    location: "東京（フルリモート可）",
    budget: "70~90万円",
    status: "募集中",
    source: "mail",
    company: "AIリサーチ株式会社",
    receivedDate: "2025-05-18T09:30:00",
    sender: "matsuda@ai-research.co.jp",
    senderName: "松田 洋子",
    senderEmail: "matsuda@ai-research.co.jp",
    senders: [
      {
        name: "松田 洋子",
        email: "matsuda@ai-research.co.jp",
        position: "研究開発部門長"
      }
    ],
    createdAt: "2025-05-18",
    keyTechnologies: "Python, TensorFlow, Scikit-learn, 機械学習",
    registrationType: "自動（メール）",
    startDate: "2025-06-01",
    foreignerAccepted: true,
    freelancerAccepted: true,
    manager: "高橋 誠",
    managerEmail: "takahashi@ai-research.co.jp",
    experience: "3年以上",
    workType: "フルリモート",
    duration: "長期（1年以上）",
    japanese: "日常会話レベル",
    priority: "高",
    processes: ["要件定義", "データ分析", "モデル開発", "評価"],
    interviewCount: "2",
    detailDescription: `
機械学習モデルの研究開発を行うデータサイエンティストを募集しています。

【業務内容】
- 大規模データの分析と前処理
- 機械学習モデルの設計と実装
- モデルの評価と改善
- ビジネス部門との連携によるソリューション提案

【必要スキル・経験】
- Pythonでのデータ分析・機械学習の実務経験3年以上
- 統計学の知識
- TensorFlow、PyTorch等のディープラーニングフレームワークの使用経験
- データ可視化の経験

【開発環境】
- 言語：Python
- フレームワーク：TensorFlow, PyTorch, Scikit-learn
- データ処理：Pandas, NumPy
- 可視化：Matplotlib, Seaborn

【勤務条件】
- フルリモート可
- 稼働時間：160〜180時間/月
- 単価：70〜90万円（スキル・経験による）
- 長期案件（1年以上を想定）
`,
    description: "機械学習モデルの研究開発を行うデータサイエンティストを募集しています。大規模データ分析と機械学習モデル開発が主な業務です。"
  },
  {
    id: "e5f6a7b8-c9d0-1234-def0-56789abcdef1",
    title: "セキュリティエンジニア",
    skills: ["情報セキュリティ", "脆弱性診断", "ペネトレーションテスト"],
    location: "大阪",
    budget: "65~85万円",
    status: "募集中",
    source: "mail",
    company: "セキュアネットワーク株式会社",
    receivedDate: "2025-05-20T11:20:00",
    sender: "yamamoto@secure-network.co.jp",
    senderName: "山本 康弘",
    senderEmail: "yamamoto@secure-network.co.jp",
    senders: [
      {
        name: "山本 康弘",
        email: "yamamoto@secure-network.co.jp",
        position: "セキュリティ部門マネージャー"
      }
    ],
    createdAt: "2025-05-20",
    keyTechnologies: "セキュリティ診断, ペネトレーションテスト, SIEM",
    registrationType: "自動（メール）",
    startDate: "2025-07-15",
    foreignerAccepted: false,
    freelancerAccepted: true,
    manager: "中村 隆",
    managerEmail: "nakamura@secure-network.co.jp",
    experience: "5年以上",
    workType: "オンサイト（大阪市内）",
    duration: "6ヶ月（延長の可能性あり）",
    japanese: "ネイティブレベル",
    priority: "中",
    processes: ["セキュリティ診断", "脆弱性対策", "セキュリティ強化策の提案"],
    interviewCount: "3",
    detailDescription: `
情報セキュリティ対策を担当するセキュリティエンジニアを募集しています。

【業務内容】
- セキュリティ診断（脆弱性診断、ペネトレーションテスト）
- セキュリティインシデント対応
- セキュリティポリシーの策定
- セキュリティ教育の実施

【必要スキル・経験】
- 情報セキュリティ分野での実務経験5年以上
- 脆弱性診断・ペネトレーションテストの実施経験
- セキュリティツールの導入・運用経験
- セキュリティ関連の資格保有者（CISSP、情報セキュリティスペシャリスト等）

【歓迎スキル】
- サイバーセキュリティ対策の経験
- CSIRT（Computer Security Incident Response Team）での活動経験
- プログラミングスキル（Python、Bash等）

【勤務条件】
- オンサイト勤務（大阪市内）
- 稼働時間：160〜180時間/月
- 単価：65〜85万円
- 期間：6ヶ月（延長の可能性あり）
`,
    description: "情報セキュリティ対策を担当するセキュリティエンジニアを募集しています。脆弱性診断・ペネトレーションテストが主な業務です。"
  },
  {
    id: "f6a7b8c9-d0e1-2345-ef01-6789abcdef12",
    title: "AWSクラウドアーキテクト",
    skills: ["AWS", "クラウドアーキテクチャ", "サーバーレス"],
    location: "東京",
    budget: "75~95万円",
    status: "募集中",
    source: "mail",
    company: "クラウドソリューション株式会社",
    receivedDate: "2025-05-22T14:30:00",
    sender: "tanaka@cloud-solutions.co.jp",
    senderName: "田中 雄一",
    senderEmail: "tanaka@cloud-solutions.co.jp",
    senders: [
      {
        name: "田中 雄一",
        email: "tanaka@cloud-solutions.co.jp",
        position: "クラウドソリューション部長"
      },
      {
        name: "佐々木 健",
        email: "sasaki@cloud-solutions.co.jp",
        position: "営業担当"
      }
    ],
    createdAt: "2025-05-22",
    keyTechnologies: "AWS, サーバーレス, マイクロサービス",
    registrationType: "自動（メール）",
    startDate: "2025-06-15",
    foreignerAccepted: true,
    freelancerAccepted: true,
    manager: "佐々木 健",
    managerEmail: "sasaki@cloud-solutions.co.jp",
    experience: "5年以上",
    workType: "週2回オンサイト/リモート併用可",
    duration: "1年（延長の可能性あり）",
    japanese: "ビジネスレベル",
    priority: "高",
    processes: ["要件定義", "基本設計", "詳細設計", "運用保守"],
    interviewCount: "2",
    detailDescription: `
大規模基幹システムのクラウド移行を担当するAWSクラウドアーキテクトを募集しています。

【業務内容】
- オンプレミス環境からAWSへの移行設計・構築
- クラウドアーキテクチャの最適化設計
- サーバーレスアーキテクチャの設計・実装
- マイクロサービス化の推進

【必要スキル・経験】
- AWSでのクラウドアーキテクト経験5年以上
- AWS認定資格（ソリューションアーキテクト - プロフェッショナル以上）
- 大規模システム移行プロジェクトの経験
- サーバーレスアーキテクチャの設計・実装経験

【歓迎スキル】
- コンテナ技術（Docker、Kubernetes）の知識
- CI/CDパイプラインの構築経験
- マルチクラウド環境の設計経験
- コスト最適化の知識

【勤務条件】
- 週2回オンサイト（東京都内）、他はリモート勤務
- 稼働時間：160〜180時間/月
- 単価：75〜95万円（スキル・経験により）
- 期間：1年（延長の可能性あり）
`,
    description: "大規模基幹システムのクラウド移行を担当するAWSクラウドアーキテクトを募集しています。オンプレミスからAWSへの移行が主な業務です。"
  },
  {
    id: "a7b8c9d0-e1f2-3456-f012-789abcdef123",
    title: "フルスタックエンジニア",
    skills: ["React", "Node.js", "MongoDB"],
    location: "福岡（リモート可）",
    budget: "60~80万円",
    status: "募集中",
    source: "mail",
    company: "テックイノベーション株式会社",
    receivedDate: "2025-05-25T10:45:00",
    sender: "watanabe@tech-innovation.co.jp",
    senderName: "渡辺 健太",
    senderEmail: "watanabe@tech-innovation.co.jp",
    senders: [
      {
        name: "渡辺 健太",
        email: "watanabe@tech-innovation.co.jp",
        position: "開発部マネージャー"
      }
    ],
    createdAt: "2025-05-25",
    keyTechnologies: "React, Node.js, MongoDB, Express",
    registrationType: "自動（メール）",
    startDate: "2025-07-01",
    foreignerAccepted: true,
    freelancerAccepted: true,
    manager: "佐藤 隆",
    managerEmail: "sato@tech-innovation.co.jp",
    experience: "3年以上",
    workType: "リモート（月1回オンサイト）",
    duration: "6ヶ月〜12ヶ月",
    japanese: "ビジネス会話レベル",
    priority: "中",
    processes: ["基本設計", "詳細設計", "製造", "単体テスト"],
    interviewCount: "1",
    detailDescription: `
Webアプリケーションの開発を担当するフルスタックエンジニアを募集しています。

【業務内容】
- フロントエンド（React）の設計・実装
- バックエンド（Node.js/Express）の設計・実装
- データベース（MongoDB）の設計・実装
- APIの設計・実装

【必要スキル・経験】
- React, Node.jsでの開発経験3年以上
- RESTful APIの設計・実装経験
- MongoDBなどのNoSQLデータベース使用経験
- GitHubを使用したチーム開発経験

【開発環境】
- フロントエンド：React, TypeScript
- バックエンド：Node.js, Express
- データベース：MongoDB
- その他：Docker, GitHub Actions

【勤務条件】
- リモートワーク主体（月1回福岡オフィスでの打ち合わせあり）
- 稼働時間：140〜160時間/月
- 単価：60〜80万円
- 期間：6ヶ月〜12ヶ月（延長の可能性あり）
`,
    description: "Webアプリケーションの開発を担当するフルスタックエンジニアを募集しています。ReactとNode.jsを使った開発が中心です。"
  },
  {
    id: "b8c9d0e1-f2a3-4567-0123-89abcdef1234",
    title: "DevOpsエンジニア",
    skills: ["Jenkins", "AWS", "Terraform", "Ansible"],
    location: "東京（週3リモート可）",
    budget: "70~90万円",
    status: "募集中",
    source: "mail",
    company: "デジタルトランスフォーメーション株式会社",
    receivedDate: "2025-05-28T13:15:00",
    sender: "nakamura@digital-transformation.co.jp",
    senderName: "中村 健太",
    senderEmail: "nakamura@digital-transformation.co.jp",
    senders: [
      {
        name: "中村 健太",
        email: "nakamura@digital-transformation.co.jp",
        position: "DevOps部門リーダー"
      }
    ],
    createdAt: "2025-05-28",
    keyTechnologies: "Jenkins, AWS, Terraform, Ansible, CI/CD",
    registrationType: "自動（メール）",
    startDate: "2025-06-15",
    foreignerAccepted: true,
    freelancerAccepted: false,
    manager: "鈴木 大輔",
    managerEmail: "suzuki@digital-transformation.co.jp",
    experience: "4年以上",
    workType: "週2回オンサイト/週3回リモート",
    duration: "1年（延長の可能性あり）",
    japanese: "ビジネスレベル",
    priority: "高",
    processes: ["設計", "自動化構築", "運用改善"],
    interviewCount: "2",
    detailDescription: `
CI/CD環境の構築・運用を担当するDevOpsエンジニアを募集しています。

【業務内容】
- CI/CDパイプラインの構築・改善
- インフラ環境の自動化（IaC）
- 監視・ロギング環境の整備
- 開発・運用プロセスの改善

【必要スキル・経験】
- CI/CDツール（Jenkins、GitLab CI等）の構築・運用経験
- AWS環境でのインフラ構築経験
- Terraform、Ansibleなどのツールを使用した自動化経験
- Linux/Unixサーバー運用経験

【歓迎スキル】
- Kubernetes環境の構築・運用経験
- コンテナ技術（Docker）の実務経験
- プログラミングスキル（Python, Go等）
- セキュリティ対策の知識

【勤務条件】
- 週2日オンサイト（東京都内）、週3日リモートワーク
- 稼働時間：160〜180時間/月
- 単価：70〜90万円（スキル・経験による）
- 期間：1年（延長の可能性あり）
`,
    description: "CI/CD環境の構築・運用を担当するDevOpsエンジニアを募集しています。インフラ自動化とCI/CDパイプラインの整備が主な業務です。"
  },
  {
    id: "c9d0e1f2-a3b4-5678-1234-9abcdef12345",
    title: "iOS/Androidアプリ開発者",
    skills: ["Swift", "Kotlin", "Flutter"],
    location: "大阪（フルリモート可）",
    budget: "65~85万円",
    status: "募集中",
    source: "mail",
    company: "モバイルソリューションズ株式会社",
    receivedDate: "2025-05-30T09:20:00",
    sender: "yamada@mobile-solutions.co.jp",
    senderName: "山田 直樹",
    senderEmail: "yamada@mobile-solutions.co.jp",
    senders: [
      {
        name: "山田 直樹",
        email: "yamada@mobile-solutions.co.jp",
        position: "モバイルアプリ部門長"
      },
      {
        name: "田中 美咲",
        email: "tanaka@mobile-solutions.co.jp",
        position: "HR担当"
      }
    ],
    createdAt: "2025-05-30",
    keyTechnologies: "Swift, Kotlin, Flutter, Firebase",
    registrationType: "自動（メール）",
    startDate: "2025-06-01",
    foreignerAccepted: true,
    freelancerAccepted: true,
    manager: "伊藤 健",
    managerEmail: "ito@mobile-solutions.co.jp",
    experience: "3年以上",
    workType: "フルリモート",
    duration: "6ヶ月（延長の可能性あり）",
    japanese: "日常会話レベル",
    priority: "中",
    processes: ["基本設計", "詳細設計", "製造", "単体テスト"],
    interviewCount: "2",
    detailDescription: `
iOS/Androidアプリ開発を担当するモバイルアプリ開発者を募集しています。

【業務内容】
- iOSアプリ開発（Swift）
- Androidアプリ開発（Kotlin）
- Flutterを使用したクロスプラットフォーム開発
- Firebase連携機能の実装

【必要スキル・経験】
- iOS/AndroidまたはFlutterでの開発経験3年以上
- アプリの設計・実装・テスト・リリース経験
- Firebase（Authentication, Firestore, Cloud Functions等）の使用経験
- 複雑なUIの実装経験

【歓迎スキル】
- CI/CDの知識・経験
- バックエンド開発の経験
- UX/UIデザインの知識
- アプリのパフォーマンス最適化の経験

【勤務条件】
- フルリモート可
- 稼働時間：140〜160時間/月
- 単価：65〜85万円
- 期間：6ヶ月（延長の可能性あり）
`,
    description: "iOS/Androidアプリ開発を担当するモバイルアプリ開発者を募集しています。SwiftやKotlin、Flutterを使用した開発が主な業務です。"
  },
  {
    id: "d0e1f2a3-b4c5-6789-2345-abcdef123456",
    title: "UI/UXデザイナー",
    skills: ["Figma", "Adobe XD", "Sketch"],
    location: "東京（週2リモート可）",
    budget: "60~80万円",
    status: "募集中",
    source: "mail",
    company: "クリエイティブデザイン株式会社",
    receivedDate: "2025-06-02T11:30:00",
    sender: "suzuki@creative-design.co.jp",
    senderName: "鈴木 明美",
    senderEmail: "suzuki@creative-design.co.jp",
    senders: [
      {
        name: "鈴木 明美",
        email: "suzuki@creative-design.co.jp",
        position: "デザイン部門長"
      }
    ],
    createdAt: "2025-06-02",
    keyTechnologies: "Figma, Adobe XD, ユーザーテスト",
    registrationType: "自動（メール）",
    startDate: "2025-07-01",
    foreignerAccepted: true,
    freelancerAccepted: true,
    manager: "高橋 真理",
    managerEmail: "takahashi@creative-design.co.jp",
    experience: "3年以上",
    workType: "週3オンサイト/週2リモート",
    duration: "6ヶ月〜12ヶ月",
    japanese: "ビジネス会話レベル",
    priority: "中",
    processes: ["要件定義", "デザイン設計", "プロトタイプ作成", "ユーザーテスト"],
    interviewCount: "2",
    detailDescription: `
Webサービス・モバイルアプリのUI/UXデザインを担当するデザイナーを募集しています。

【業務内容】
- UI/UXデザイン設計
- プロトタイプの作成
- ユーザーテストの実施・分析
- デザインシステムの構築

【必要スキル・経験】
- UI/UXデザインの実務経験3年以上
- Figma, Adobe XD, Sketchいずれかの高度な使用経験
- ユーザーテスト・分析の経験
- フロントエンド開発者との協業経験

【歓迎スキル】
- HTML/CSSの基本的な知識
- アニメーション・インタラクションデザインの経験
- アクセシビリティに関する知識
- 情報アーキテクチャの知識

【勤務条件】
- 週3日オンサイト（東京都内）、週2日リモートワーク
- 稼働時間：140〜160時間/月
- 単価：60〜80万円
- 期間：6ヶ月〜12ヶ月（延長の可能性あり）
`,
    description: "WebサービスとモバイルアプリのUI/UXデザインを担当するデザイナーを募集しています。デザイン設計からユーザーテストまで一貫して担当できる方を求めています。"
  }
];

// Helper function to get companies from case data
export const getCompanyList = () => {
  return Array.from(new Set(caseData.filter(item => item.company).map(item => item.company)));
};


(() => {
  const LOCALES = {
    en: {
      app_name: "YomiRuby",
      popup_enable_on_all_pages: "Enable on all pages",
      popup_enabled_on_all_pages: "Enabled on all pages",
      popup_disabled_on_all_pages: "Disabled on all pages.",
      popup_run_annotation_now: "Run Annotation Now",
      popup_cancel_running_job: "Cancel Running Job",
      popup_hide_kana: "Hide Kana",
      popup_show_kana: "Show Kana",
      popup_open_settings: "Open Settings",
      popup_no_active_tab: "No active tab available.",
      popup_page_cannot_be_annotated: "This page cannot be annotated.",
      popup_starting_annotation: "Starting annotation...",
      popup_starting: "Starting...",
      popup_annotating: "Annotating... {{percent}}%",
      popup_annotation_completed: "Annotation completed.",
      popup_annotation_canceled: "Annotation canceled.",
      popup_annotation_failed: "Annotation failed.",
      popup_done_summary: "Done: scanned {{scanned}}, updated {{updated}}, ruby {{ruby}}.",
      popup_cancel_requested: "Cancel requested.",
      popup_cancel_request_failed: "Cancel request failed.",
      popup_no_target_page: "No target page.",
      popup_cannot_toggle_kana_while_running: "Cannot change kana visibility while annotation is running.",
      popup_kana_hidden: "Kana hidden.",
      popup_kana_shown: "Kana shown.",
      popup_kana_visibility_failed: "Kana visibility change failed.",
      popup_initialization_failed: "Popup initialization failed.",
      options_title: "YomiRuby Settings",
      options_description: "Choose an annotation engine: Yahoo API or local dictionary.",
      options_client_id_label: "Yahoo Client ID",
      options_client_id_placeholder: "Paste your Yahoo Client ID",
      options_ui_language_label: "UI language",
      options_ui_language_help: "Select the extension UI language. Auto follows your browser language.",
      options_ui_language_auto: "Auto (browser language)",
      options_annotation_mode_label: "Annotation mode",
      options_annotation_mode_help: "Yahoo API uses your Client ID. Local dictionary runs fully offline.",
      options_mode_yahoo_api: "Yahoo API (Client ID required)",
      options_mode_local_dict: "Local dictionary (offline)",
      options_offline_mode_label: "Offline mode (use local dictionary)",
      options_offline_mode_help: "You can annotate with the local dictionary even without a Client ID.",
      options_test_client_id: "Test Client ID",
      options_save_settings: "Save Settings",
      options_how_to_get_client_id: "How to get the Client ID",
      options_step_1: "Sign in to the Yahoo! JAPAN Developer Network.",
      options_step_2: "Create an app and enable FuriganaService.",
      options_step_3: "Copy the generated Client ID and paste it here.",
      options_furigana_reference: "Furigana API reference",
      options_enter_client_id_before_testing: "Enter a Client ID before testing.",
      options_client_id_should_not_contain_spaces: "Client ID should not contain spaces.",
      options_client_id_looks_too_short: "Client ID looks too short.",
      options_provide_client_id_for_yahoo_mode: "Yahoo API mode requires a Client ID.",
      options_provide_client_id_or_enable_offline: "Provide a Client ID or enable offline mode.",
      options_settings_saved: "Settings saved.",
      options_testing_client_id: "Testing Client ID...",
      options_client_id_test_succeeded: "Client ID test succeeded.",
      options_client_id_test_failed: "Client ID test failed.",
      content_preparing: "Preparing...",
      content_starting_annotation: "Starting annotation...",
      content_no_kanji_text_found: "No kanji text found.",
      content_updating_page: "Updating page...",
      content_final_pass: "Final pass...",
      content_final_pass_done: "Final pass done.",
      content_paragraph_progress: "{{current}} / {{total}} paragraphs",
      content_paragraph_progress_with_ruby: "{{current}} / {{total}} paragraphs | ruby {{ruby}}",
      content_annotation_completed: "Annotation completed.",
      content_annotation_canceled: "Annotation canceled.",
      content_annotation_failed: "Annotation failed.",
      content_annotation_stopped: "Annotation stopped.",
      content_cancel_requested: "Cancel requested...",
      content_annotation_already_running: "An annotation job is already running.",
      content_no_root_node: "No document root available.",
      content_no_running_annotation_job: "No running annotation job.",
      content_kana_hidden: "Kana hidden.",
      content_kana_shown: "Kana shown.",
      content_kana_visibility_failed: "Kana visibility change failed."
    },
    ja: {
      app_name: "YomiRuby",
      popup_enable_on_all_pages: "すべてのページで有効にする",
      popup_enabled_on_all_pages: "すべてのページで有効",
      popup_disabled_on_all_pages: "すべてのページで無効",
      popup_run_annotation_now: "今すぐ注釈する",
      popup_cancel_running_job: "実行中の処理を中止",
      popup_hide_kana: "ふりがなを隠す",
      popup_show_kana: "ふりがなを表示",
      popup_open_settings: "設定を開く",
      popup_no_active_tab: "有効なタブがありません。",
      popup_page_cannot_be_annotated: "このページは注釈できません。",
      popup_starting_annotation: "注釈を開始しています。",
      popup_starting: "開始中...",
      popup_annotating: "注釈中... {{percent}}%",
      popup_annotation_completed: "注釈が完了しました。",
      popup_annotation_canceled: "注釈をキャンセルしました。",
      popup_annotation_failed: "注釈に失敗しました。",
      popup_done_summary: "完了: 解析 {{scanned}}、更新 {{updated}}、ruby {{ruby}}。",
      popup_cancel_requested: "キャンセルを要求しました。",
      popup_cancel_request_failed: "キャンセル要求に失敗しました。",
      popup_no_target_page: "対象ページがありません。",
      popup_cannot_toggle_kana_while_running: "注釈実行中はふりがなの表示を切り替えられません。",
      popup_kana_hidden: "ふりがなを非表示にしました。",
      popup_kana_shown: "ふりがなを表示しました。",
      popup_kana_visibility_failed: "ふりがなの表示切り替えに失敗しました。",
      popup_initialization_failed: "ポップアップの初期化に失敗しました。",
      options_title: "YomiRuby 設定",
      options_description: "注釈エンジンを選択します。Yahoo API またはローカル辞書を使用できます。",
      options_client_id_label: "Yahoo Client ID",
      options_client_id_placeholder: "Yahoo Client ID を貼り付け",
      options_ui_language_label: "表示言語",
      options_ui_language_help: "拡張機能の表示言語を選択します。自動はブラウザ言語に従います。",
      options_ui_language_auto: "自動（ブラウザ言語）",
      options_annotation_mode_label: "注釈モード",
      options_annotation_mode_help: "Yahoo API は Client ID を使用します。ローカル辞書は完全オフラインで動作します。",
      options_mode_yahoo_api: "Yahoo API（Client ID 必須）",
      options_mode_local_dict: "ローカル辞書（オフライン）",
      options_offline_mode_label: "オフラインモード（ローカル辞書を使用）",
      options_offline_mode_help: "Client ID がなくても、ローカル辞書で注釈できます。",
      options_test_client_id: "Client ID をテスト",
      options_save_settings: "設定を保存",
      options_how_to_get_client_id: "Client ID の取得方法",
      options_step_1: "Yahoo! JAPAN Developer Network にサインインします。",
      options_step_2: "アプリを作成し、FuriganaService を有効にします。",
      options_step_3: "生成された Client ID をここに貼り付けます。",
      options_furigana_reference: "ふりがな API リファレンス",
      options_enter_client_id_before_testing: "テスト前に Client ID を入力してください。",
      options_client_id_should_not_contain_spaces: "Client ID に空白は含められません。",
      options_client_id_looks_too_short: "Client ID が短すぎるようです。",
      options_provide_client_id_for_yahoo_mode: "Yahoo API モードでは Client ID が必要です。",
      options_provide_client_id_or_enable_offline: "Client ID を入力するか、オフラインモードを有効にしてください。",
      options_settings_saved: "設定を保存しました。",
      options_testing_client_id: "Client ID をテスト中...",
      options_client_id_test_succeeded: "Client ID のテストに成功しました。",
      options_client_id_test_failed: "Client ID のテストに失敗しました。",
      content_preparing: "準備中...",
      content_starting_annotation: "注釈を開始しています...",
      content_no_kanji_text_found: "漢字テキストが見つかりませんでした。",
      content_updating_page: "ページを更新しています...",
      content_final_pass: "最終確認中...",
      content_final_pass_done: "最終確認が完了しました。",
      content_paragraph_progress: "{{current}} / {{total}} 段落",
      content_paragraph_progress_with_ruby: "{{current}} / {{total}} 段落 | ruby {{ruby}}",
      content_annotation_completed: "注釈が完了しました。",
      content_annotation_canceled: "注釈をキャンセルしました。",
      content_annotation_failed: "注釈に失敗しました。",
      content_annotation_stopped: "注釈を停止しました。",
      content_cancel_requested: "キャンセルを要求しました...",
      content_annotation_already_running: "注釈ジョブはすでに実行中です。",
      content_no_root_node: "ドキュメントのルートがありません。",
      content_no_running_annotation_job: "実行中の注釈ジョブはありません。",
      content_kana_hidden: "ふりがなを非表示にしました。",
      content_kana_shown: "ふりがなを表示しました。",
      content_kana_visibility_failed: "ふりがなの表示切り替えに失敗しました。",
    },
    "zh-CN": {
      app_name: "YomiRuby",
      popup_enable_on_all_pages: "在所有页面启用",
      popup_enabled_on_all_pages: "已在所有页面启用",
      popup_disabled_on_all_pages: "已在所有页面停用",
      popup_run_annotation_now: "立即注音",
      popup_cancel_running_job: "取消正在运行的任务",
      popup_hide_kana: "隐藏假名",
      popup_show_kana: "显示假名",
      popup_open_settings: "打开设置",
      popup_no_active_tab: "没有可用的活动标签页。",
      popup_page_cannot_be_annotated: "此页面无法注音。",
      popup_starting_annotation: "正在开始注音。",
      popup_starting: "正在启动...",
      popup_annotating: "正在注音... {{percent}}%",
      popup_annotation_completed: "注音已完成。",
      popup_annotation_canceled: "注音已取消。",
      popup_annotation_failed: "注音失败。",
      popup_done_summary: "完成：扫描 {{scanned}}，更新 {{updated}}，ruby {{ruby}}。",
      popup_cancel_requested: "已请求取消。",
      popup_cancel_request_failed: "取消请求失败。",
      popup_no_target_page: "没有目标页面。",
      popup_cannot_toggle_kana_while_running: "注音运行中时无法切换假名显示。",
      popup_kana_hidden: "假名已隐藏。",
      popup_kana_shown: "假名已显示。",
      popup_kana_visibility_failed: "切换假名显示失败。",
      popup_initialization_failed: "弹出窗口初始化失败。",
      options_title: "YomiRuby 设置",
      options_description: "选择注音引擎：Yahoo API 或本地词典。",
      options_client_id_label: "Yahoo Client ID",
      options_client_id_placeholder: "粘贴 Yahoo Client ID",
      options_annotation_mode_label: "注音模式",
      options_annotation_mode_help: "Yahoo API 使用 Client ID。本地词典完全离线运行。",
      options_mode_yahoo_api: "Yahoo API（需要 Client ID）",
      options_mode_local_dict: "本地词典（离线）",
      options_offline_mode_label: "离线模式（使用本地词典）",
      options_offline_mode_help: "即使没有 Client ID，也可以用本地词典注音。",
      options_test_client_id: "测试 Client ID",
      options_save_settings: "保存设置",
      options_how_to_get_client_id: "如何获取 Client ID",
      options_step_1: "登录 Yahoo! JAPAN Developer Network。",
      options_step_2: "创建应用并启用 FuriganaService。",
      options_step_3: "将生成的 Client ID 粘贴到这里。",
      options_furigana_reference: "注音 API 参考",
      options_enter_client_id_before_testing: "测试前请输入 Client ID。",
      options_client_id_should_not_contain_spaces: "Client ID 不能包含空格。",
      options_client_id_looks_too_short: "Client ID 看起来太短。",
      options_provide_client_id_for_yahoo_mode: "Yahoo API 模式需要 Client ID。",
      options_provide_client_id_or_enable_offline: "请输入 Client ID，或启用离线模式。",
      options_settings_saved: "设置已保存。",
      options_testing_client_id: "正在测试 Client ID...",
      options_client_id_test_succeeded: "Client ID 测试成功。",
      options_client_id_test_failed: "Client ID 测试失败。",
      content_preparing: "准备中...",
      content_starting_annotation: "正在开始注音...",
      content_no_kanji_text_found: "未找到汉字文本。",
      content_updating_page: "正在更新页面...",
      content_final_pass: "最终检查中...",
      content_final_pass_done: "最终检查完成。",
      content_paragraph_progress: "{{current}} / {{total}} 段落",
      content_paragraph_progress_with_ruby: "{{current}} / {{total}} 段落 | ruby {{ruby}}",
      content_annotation_completed: "注音已完成。",
      content_annotation_canceled: "注音已取消。",
      content_annotation_failed: "注音失败。",
      content_annotation_stopped: "注音已停止。",
      content_cancel_requested: "已请求取消...",
      content_annotation_already_running: "注音任务已在运行。",
      content_no_root_node: "没有可用的文档根节点。",
      content_no_running_annotation_job: "没有正在运行的注音任务。",
      content_kana_hidden: "假名已隐藏。",
      content_kana_shown: "假名已显示。",
      content_kana_visibility_failed: "切换假名显示失败。"
    },
    ko: {
      app_name: "YomiRuby",
      popup_enable_on_all_pages: "모든 페이지에서 사용",
      popup_enabled_on_all_pages: "모든 페이지에서 사용 중",
      popup_disabled_on_all_pages: "모든 페이지에서 사용 안 함",
      popup_run_annotation_now: "지금 주석하기",
      popup_cancel_running_job: "실행 중인 작업 취소",
      popup_hide_kana: "가나 숨기기",
      popup_show_kana: "가나 표시",
      popup_open_settings: "설정 열기",
      popup_no_active_tab: "활성 탭이 없습니다.",
      popup_page_cannot_be_annotated: "이 페이지는 주석할 수 없습니다.",
      popup_starting_annotation: "주석을 시작하는 중입니다.",
      popup_starting: "시작하는 중...",
      popup_annotating: "주석 중... {{percent}}%",
      popup_annotation_completed: "주석이 완료되었습니다.",
      popup_annotation_canceled: "주석이 취소되었습니다.",
      popup_annotation_failed: "주석에 실패했습니다.",
      popup_done_summary: "완료: 검사 {{scanned}}, 업데이트 {{updated}}, ruby {{ruby}}.",
      popup_cancel_requested: "취소를 요청했습니다.",
      popup_cancel_request_failed: "취소 요청에 실패했습니다.",
      popup_no_target_page: "대상 페이지가 없습니다.",
      popup_cannot_toggle_kana_while_running: "주석이 실행 중일 때는 가나 표시를 바꿀 수 없습니다.",
      popup_kana_hidden: "가나를 숨겼습니다.",
      popup_kana_shown: "가나를 표시했습니다.",
      popup_kana_visibility_failed: "가나 표시 전환에 실패했습니다.",
      popup_initialization_failed: "팝업 초기화에 실패했습니다.",
      options_title: "YomiRuby 설정",
      options_description: "주석 엔진을 선택하세요: Yahoo API 또는 로컬 사전.",
      options_client_id_label: "Yahoo Client ID",
      options_client_id_placeholder: "Yahoo Client ID 붙여넣기",
      options_annotation_mode_label: "주석 모드",
      options_annotation_mode_help: "Yahoo API는 Client ID를 사용합니다. 로컬 사전은 완전 오프라인으로 동작합니다.",
      options_mode_yahoo_api: "Yahoo API (Client ID 필요)",
      options_mode_local_dict: "로컬 사전 (오프라인)",
      options_offline_mode_label: "오프라인 모드(로컬 사전 사용)",
      options_offline_mode_help: "Client ID가 없어도 로컬 사전으로 주석할 수 있습니다.",
      options_test_client_id: "Client ID 테스트",
      options_save_settings: "설정 저장",
      options_how_to_get_client_id: "Client ID 받는 방법",
      options_step_1: "Yahoo! JAPAN Developer Network에 로그인합니다.",
      options_step_2: "앱을 만들고 FuriganaService를 활성화합니다.",
      options_step_3: "생성된 Client ID를 여기에 붙여넣습니다.",
      options_furigana_reference: "후리가나 API 참고",
      options_enter_client_id_before_testing: "테스트 전에 Client ID를 입력하세요.",
      options_client_id_should_not_contain_spaces: "Client ID에는 공백이 포함되면 안 됩니다.",
      options_client_id_looks_too_short: "Client ID가 너무 짧아 보입니다.",
      options_provide_client_id_for_yahoo_mode: "Yahoo API 모드에는 Client ID가 필요합니다.",
      options_provide_client_id_or_enable_offline: "Client ID를 입력하거나 오프라인 모드를 활성화하세요.",
      options_settings_saved: "설정을 저장했습니다.",
      options_testing_client_id: "Client ID를 테스트하는 중...",
      options_client_id_test_succeeded: "Client ID 테스트에 성공했습니다.",
      options_client_id_test_failed: "Client ID 테스트에 실패했습니다.",
      content_preparing: "준비 중...",
      content_starting_annotation: "주석을 시작하는 중입니다...",
      content_no_kanji_text_found: "한자 텍스트를 찾지 못했습니다.",
      content_updating_page: "페이지를 업데이트하는 중입니다...",
      content_final_pass: "최종 확인 중...",
      content_final_pass_done: "최종 확인이 완료되었습니다.",
      content_paragraph_progress: "{{current}} / {{total}} 문단",
      content_paragraph_progress_with_ruby: "{{current}} / {{total}} 문단 | ruby {{ruby}}",
      content_annotation_completed: "주석이 완료되었습니다.",
      content_annotation_canceled: "주석이 취소되었습니다.",
      content_annotation_failed: "주석에 실패했습니다.",
      content_annotation_stopped: "주석이 중지되었습니다.",
      content_cancel_requested: "취소를 요청했습니다...",
      content_annotation_already_running: "주석 작업이 이미 실행 중입니다.",
      content_no_root_node: "문서 루트가 없습니다.",
      content_no_running_annotation_job: "실행 중인 주석 작업이 없습니다.",
      content_kana_hidden: "가나를 숨겼습니다.",
      content_kana_shown: "가나를 표시했습니다.",
      content_kana_visibility_failed: "가나 표시 전환에 실패했습니다."
    },
    th: {
      app_name: "YomiRuby",
      popup_enable_on_all_pages: "เปิดใช้ในทุกหน้า",
      popup_enabled_on_all_pages: "เปิดใช้ในทุกหน้าแล้ว",
      popup_disabled_on_all_pages: "ปิดใช้ในทุกหน้าแล้ว",
      popup_run_annotation_now: "เริ่มใส่คำอ่าน",
      popup_cancel_running_job: "ยกเลิกงานที่กำลังทำอยู่",
      popup_hide_kana: "ซ่อนคานะ",
      popup_show_kana: "แสดงคานะ",
      popup_open_settings: "เปิดการตั้งค่า",
      popup_no_active_tab: "ไม่มีแท็บที่ใช้งานอยู่",
      popup_page_cannot_be_annotated: "หน้านี้ไม่สามารถใส่คำอ่านได้",
      popup_starting_annotation: "กำลังเริ่มใส่คำอ่าน...",
      popup_starting: "กำลังเริ่ม...",
      popup_annotating: "กำลังใส่คำอ่าน... {{percent}}%",
      popup_annotation_completed: "ใส่คำอ่านเสร็จแล้ว",
      popup_annotation_canceled: "ยกเลิกการใส่คำอ่านแล้ว",
      popup_annotation_failed: "ใส่คำอ่านไม่สำเร็จ",
      popup_done_summary: "เสร็จสิ้น: สแกน {{scanned}}, อัปเดต {{updated}}, ruby {{ruby}}",
      popup_cancel_requested: "ส่งคำขอยกเลิกแล้ว",
      popup_cancel_request_failed: "ส่งคำขอยกเลิกไม่สำเร็จ",
      popup_no_target_page: "ไม่มีหน้าปลายทาง",
      popup_cannot_toggle_kana_while_running: "ไม่สามารถเปลี่ยนการแสดงคานะขณะกำลังใส่คำอ่านได้",
      popup_kana_hidden: "ซ่อนคานะแล้ว",
      popup_kana_shown: "แสดงคานะแล้ว",
      popup_kana_visibility_failed: "เปลี่ยนการแสดงคานะไม่สำเร็จ",
      popup_initialization_failed: "เริ่มต้นหน้าต่างป๊อปอัปไม่สำเร็จ",
      options_title: "การตั้งค่า YomiRuby",
      options_description: "เลือกโหมดการใส่คำอ่าน: Yahoo API หรือพจนานุกรมภายใน",
      options_client_id_label: "Yahoo Client ID",
      options_client_id_placeholder: "วาง Yahoo Client ID ของคุณ",
      options_annotation_mode_label: "โหมดการใส่คำอ่าน",
      options_annotation_mode_help: "Yahoo API ใช้ Client ID ส่วนพจนานุกรมภายในทำงานแบบออฟไลน์ทั้งหมด",
      options_mode_yahoo_api: "Yahoo API (ต้องมี Client ID)",
      options_mode_local_dict: "พจนานุกรมภายใน (ออฟไลน์)",
      options_offline_mode_label: "โหมดออฟไลน์ (ใช้พจนานุกรมภายใน)",
      options_offline_mode_help: "คุณสามารถใส่คำอ่านด้วยพจนานุกรมภายในได้แม้ไม่มี Client ID",
      options_test_client_id: "ทดสอบ Client ID",
      options_save_settings: "บันทึกการตั้งค่า",
      options_how_to_get_client_id: "วิธีรับ Client ID",
      options_step_1: "ลงชื่อเข้าใช้ Yahoo! JAPAN Developer Network",
      options_step_2: "สร้างแอปและเปิดใช้ FuriganaService",
      options_step_3: "คัดลอก Client ID ที่สร้างแล้วมาวางที่นี่",
      options_furigana_reference: "อ้างอิง API furigana",
      options_enter_client_id_before_testing: "กรอก Client ID ก่อนทดสอบ",
      options_client_id_should_not_contain_spaces: "Client ID ต้องไม่มีช่องว่าง",
      options_client_id_looks_too_short: "Client ID ดูสั้นเกินไป",
      options_provide_client_id_for_yahoo_mode: "โหมด Yahoo API ต้องมี Client ID",
      options_provide_client_id_or_enable_offline: "กรอก Client ID หรือเปิดโหมดออฟไลน์",
      options_settings_saved: "บันทึกการตั้งค่าแล้ว",
      options_testing_client_id: "กำลังทดสอบ Client ID...",
      options_client_id_test_succeeded: "ทดสอบ Client ID สำเร็จ",
      options_client_id_test_failed: "ทดสอบ Client ID ไม่สำเร็จ",
      content_preparing: "กำลังเตรียม...",
      content_starting_annotation: "กำลังเริ่มใส่คำอ่าน...",
      content_no_kanji_text_found: "ไม่พบข้อความคันจิ",
      content_updating_page: "กำลังอัปเดตหน้า...",
      content_final_pass: "กำลังตรวจรอบสุดท้าย...",
      content_final_pass_done: "ตรวจรอบสุดท้ายเสร็จแล้ว",
      content_paragraph_progress: "{{current}} / {{total}} ย่อหน้า",
      content_paragraph_progress_with_ruby: "{{current}} / {{total}} ย่อหน้า | ruby {{ruby}}",
      content_annotation_completed: "ใส่คำอ่านเสร็จแล้ว",
      content_annotation_canceled: "ยกเลิกการใส่คำอ่านแล้ว",
      content_annotation_failed: "ใส่คำอ่านไม่สำเร็จ",
      content_annotation_stopped: "หยุดการใส่คำอ่านแล้ว",
      content_cancel_requested: "ส่งคำขอยกเลิกแล้ว...",
      content_annotation_already_running: "มีงานใส่คำอ่านกำลังทำงานอยู่แล้ว",
      content_no_root_node: "ไม่พบโหนดรากของเอกสาร",
      content_no_running_annotation_job: "ไม่มีงานใส่คำอ่านที่กำลังทำงานอยู่",
      content_kana_hidden: "ซ่อนคานะแล้ว",
      content_kana_shown: "แสดงคานะแล้ว",
      content_kana_visibility_failed: "เปลี่ยนการแสดงคานะไม่สำเร็จ"
    },
    vi: {
      app_name: "YomiRuby",
      popup_enable_on_all_pages: "Bật trên mọi trang",
      popup_enabled_on_all_pages: "Đã bật trên mọi trang",
      popup_disabled_on_all_pages: "Đã tắt trên mọi trang",
      popup_run_annotation_now: "Chú thích ngay",
      popup_cancel_running_job: "Hủy tác vụ đang chạy",
      popup_hide_kana: "Ẩn kana",
      popup_show_kana: "Hiện kana",
      popup_open_settings: "Mở cài đặt",
      popup_no_active_tab: "Không có tab đang hoạt động.",
      popup_page_cannot_be_annotated: "Trang này không thể chú thích.",
      popup_starting_annotation: "Đang bắt đầu chú thích...",
      popup_starting: "Đang khởi động...",
      popup_annotating: "Đang chú thích... {{percent}}%",
      popup_annotation_completed: "Đã hoàn tất chú thích.",
      popup_annotation_canceled: "Đã hủy chú thích.",
      popup_annotation_failed: "Chú thích thất bại.",
      popup_done_summary: "Hoàn tất: quét {{scanned}}, cập nhật {{updated}}, ruby {{ruby}}.",
      popup_cancel_requested: "Đã gửi yêu cầu hủy.",
      popup_cancel_request_failed: "Yêu cầu hủy thất bại.",
      popup_no_target_page: "Không có trang mục tiêu.",
      popup_cannot_toggle_kana_while_running: "Không thể đổi hiển thị kana khi đang chú thích.",
      popup_kana_hidden: "Đã ẩn kana.",
      popup_kana_shown: "Đã hiện kana.",
      popup_kana_visibility_failed: "Đổi hiển thị kana thất bại.",
      popup_initialization_failed: "Khởi tạo popup thất bại.",
      options_title: "Cài đặt YomiRuby",
      options_description: "Chọn bộ máy chú thích: Yahoo API hoặc từ điển cục bộ.",
      options_client_id_label: "Yahoo Client ID",
      options_client_id_placeholder: "Dán Yahoo Client ID của bạn",
      options_annotation_mode_label: "Chế độ chú thích",
      options_annotation_mode_help: "Yahoo API dùng Client ID. Từ điển cục bộ chạy hoàn toàn ngoại tuyến.",
      options_mode_yahoo_api: "Yahoo API (cần Client ID)",
      options_mode_local_dict: "Từ điển cục bộ (ngoại tuyến)",
      options_offline_mode_label: "Chế độ ngoại tuyến (dùng từ điển cục bộ)",
      options_offline_mode_help: "Bạn có thể chú thích bằng từ điển cục bộ ngay cả khi không có Client ID.",
      options_test_client_id: "Kiểm tra Client ID",
      options_save_settings: "Lưu cài đặt",
      options_how_to_get_client_id: "Cách lấy Client ID",
      options_step_1: "Đăng nhập Yahoo! JAPAN Developer Network.",
      options_step_2: "Tạo ứng dụng và bật FuriganaService.",
      options_step_3: "Sao chép Client ID đã tạo và dán vào đây.",
      options_furigana_reference: "Tài liệu API furigana",
      options_enter_client_id_before_testing: "Hãy nhập Client ID trước khi kiểm tra.",
      options_client_id_should_not_contain_spaces: "Client ID không được chứa khoảng trắng.",
      options_client_id_looks_too_short: "Client ID có vẻ quá ngắn.",
      options_provide_client_id_for_yahoo_mode: "Chế độ Yahoo API yêu cầu Client ID.",
      options_provide_client_id_or_enable_offline: "Hãy nhập Client ID hoặc bật chế độ ngoại tuyến.",
      options_settings_saved: "Đã lưu cài đặt.",
      options_testing_client_id: "Đang kiểm tra Client ID...",
      options_client_id_test_succeeded: "Kiểm tra Client ID thành công.",
      options_client_id_test_failed: "Kiểm tra Client ID thất bại.",
      content_preparing: "Đang chuẩn bị...",
      content_starting_annotation: "Đang bắt đầu chú thích...",
      content_no_kanji_text_found: "Không tìm thấy văn bản kanji.",
      content_updating_page: "Đang cập nhật trang...",
      content_final_pass: "Đang kiểm tra cuối...",
      content_final_pass_done: "Đã hoàn tất kiểm tra cuối.",
      content_paragraph_progress: "{{current}} / {{total}} đoạn",
      content_paragraph_progress_with_ruby: "{{current}} / {{total}} đoạn | ruby {{ruby}}",
      content_annotation_completed: "Đã hoàn tất chú thích.",
      content_annotation_canceled: "Đã hủy chú thích.",
      content_annotation_failed: "Chú thích thất bại.",
      content_annotation_stopped: "Đã dừng chú thích.",
      content_cancel_requested: "Đã gửi yêu cầu hủy...",
      content_annotation_already_running: "Một tác vụ chú thích đang chạy.",
      content_no_root_node: "Không có nút gốc của tài liệu.",
      content_no_running_annotation_job: "Không có tác vụ chú thích nào đang chạy.",
      content_kana_hidden: "Đã ẩn kana.",
      content_kana_shown: "Đã hiện kana.",
      content_kana_visibility_failed: "Đổi hiển thị kana thất bại."
    },
    id: {
      app_name: "YomiRuby",
      popup_enable_on_all_pages: "Aktifkan di semua halaman",
      popup_enabled_on_all_pages: "Sudah aktif di semua halaman",
      popup_disabled_on_all_pages: "Sudah dinonaktifkan di semua halaman",
      popup_run_annotation_now: "Jalankan anotasi sekarang",
      popup_cancel_running_job: "Batalkan tugas yang berjalan",
      popup_hide_kana: "Sembunyikan kana",
      popup_show_kana: "Tampilkan kana",
      popup_open_settings: "Buka pengaturan",
      popup_no_active_tab: "Tidak ada tab aktif.",
      popup_page_cannot_be_annotated: "Halaman ini tidak dapat dianotasi.",
      popup_starting_annotation: "Memulai anotasi...",
      popup_starting: "Memulai...",
      popup_annotating: "Sedang menganotasi... {{percent}}%",
      popup_annotation_completed: "Anotasi selesai.",
      popup_annotation_canceled: "Anotasi dibatalkan.",
      popup_annotation_failed: "Anotasi gagal.",
      popup_done_summary: "Selesai: dipindai {{scanned}}, diperbarui {{updated}}, ruby {{ruby}}.",
      popup_cancel_requested: "Permintaan pembatalan dikirim.",
      popup_cancel_request_failed: "Permintaan pembatalan gagal.",
      popup_no_target_page: "Tidak ada halaman target.",
      popup_cannot_toggle_kana_while_running: "Tidak bisa mengubah tampilan kana saat anotasi berjalan.",
      popup_kana_hidden: "Kana disembunyikan.",
      popup_kana_shown: "Kana ditampilkan.",
      popup_kana_visibility_failed: "Gagal mengubah tampilan kana.",
      popup_initialization_failed: "Gagal memulai popup.",
      options_title: "Pengaturan YomiRuby",
      options_description: "Pilih mesin anotasi: Yahoo API atau kamus lokal.",
      options_client_id_label: "Yahoo Client ID",
      options_client_id_placeholder: "Tempel Yahoo Client ID Anda",
      options_annotation_mode_label: "Mode anotasi",
      options_annotation_mode_help: "Yahoo API memakai Client ID. Kamus lokal berjalan sepenuhnya offline.",
      options_mode_yahoo_api: "Yahoo API (perlu Client ID)",
      options_mode_local_dict: "Kamus lokal (offline)",
      options_offline_mode_label: "Mode offline (pakai kamus lokal)",
      options_offline_mode_help: "Anda bisa menganotasi dengan kamus lokal meski tanpa Client ID.",
      options_test_client_id: "Uji Client ID",
      options_save_settings: "Simpan pengaturan",
      options_how_to_get_client_id: "Cara mendapatkan Client ID",
      options_step_1: "Masuk ke Yahoo! JAPAN Developer Network.",
      options_step_2: "Buat aplikasi dan aktifkan FuriganaService.",
      options_step_3: "Salin Client ID yang dibuat lalu tempel di sini.",
      options_furigana_reference: "Referensi API furigana",
      options_enter_client_id_before_testing: "Masukkan Client ID sebelum menguji.",
      options_client_id_should_not_contain_spaces: "Client ID tidak boleh berisi spasi.",
      options_client_id_looks_too_short: "Client ID terlihat terlalu pendek.",
      options_provide_client_id_for_yahoo_mode: "Mode Yahoo API membutuhkan Client ID.",
      options_provide_client_id_or_enable_offline: "Masukkan Client ID atau aktifkan mode offline.",
      options_settings_saved: "Pengaturan disimpan.",
      options_testing_client_id: "Menguji Client ID...",
      options_client_id_test_succeeded: "Uji Client ID berhasil.",
      options_client_id_test_failed: "Uji Client ID gagal.",
      content_preparing: "Menyiapkan...",
      content_starting_annotation: "Memulai anotasi...",
      content_no_kanji_text_found: "Tidak ada teks kanji yang ditemukan.",
      content_updating_page: "Memperbarui halaman...",
      content_final_pass: "Pemeriksaan akhir...",
      content_final_pass_done: "Pemeriksaan akhir selesai.",
      content_paragraph_progress: "{{current}} / {{total}} paragraf",
      content_paragraph_progress_with_ruby: "{{current}} / {{total}} paragraf | ruby {{ruby}}",
      content_annotation_completed: "Anotasi selesai.",
      content_annotation_canceled: "Anotasi dibatalkan.",
      content_annotation_failed: "Anotasi gagal.",
      content_annotation_stopped: "Anotasi dihentikan.",
      content_cancel_requested: "Permintaan pembatalan dikirim...",
      content_annotation_already_running: "Tugas anotasi sudah berjalan.",
      content_no_root_node: "Tidak ada akar dokumen.",
      content_no_running_annotation_job: "Tidak ada tugas anotasi yang berjalan.",
      content_kana_hidden: "Kana disembunyikan.",
      content_kana_shown: "Kana ditampilkan.",
      content_kana_visibility_failed: "Gagal mengubah tampilan kana."
    }
  };

  const SUPPORTED_LOCALES = Object.freeze([
    { code: "auto", label: "Auto" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "zh-CN", label: "简体中文" },
    { code: "ko", label: "한국어" },
    { code: "th", label: "ไทย" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "id", label: "Bahasa Indonesia" },
    { code: "fr", label: "Français" },
    { code: "pt-BR", label: "Português (Brasil)" },
    { code: "hi", label: "हिन्दी" },
    { code: "ms", label: "Bahasa Melayu" },
    { code: "fil", label: "Filipino" },
    { code: "my", label: "မြန်မာဘာသာ" },
    { code: "ne", label: "नेपाली" },
    { code: "si", label: "සිංහල" }
  ]);

  const SUPPORTED_LOCALE_CODES = new Set(SUPPORTED_LOCALES.map((entry) => entry.code));
  const LOCALE_BY_LOWER = new Map(
    SUPPORTED_LOCALES
      .filter((entry) => entry.code !== "auto")
      .map((entry) => [entry.code.toLowerCase(), entry.code])
  );
  const STORAGE_UI_LOCALE_KEY =
    globalThis.YomiRubyConstants?.STORAGE_KEYS?.UI_LOCALE || "yomirubyUiLocale";

  let localePreference = "auto";
  let activeLocale = "en";
  let initInFlight = null;

  function normalizeLocale(locale) {
    const value = String(locale || "").trim().replace("_", "-");
    if (!value) {
      return "en";
    }

    const lower = value.toLowerCase();
    const direct = LOCALE_BY_LOWER.get(lower);
    if (direct) {
      return direct;
    }

    if (lower.startsWith("ja")) {
      return "ja";
    }
    if (lower.startsWith("zh")) {
      return "zh-CN";
    }
    if (lower.startsWith("ko")) {
      return "ko";
    }
    if (lower.startsWith("th")) {
      return "th";
    }
    if (lower.startsWith("vi")) {
      return "vi";
    }
    if (lower.startsWith("id")) {
      return "id";
    }
    if (lower.startsWith("fr")) {
      return "fr";
    }
    if (lower.startsWith("pt")) {
      return "pt-BR";
    }
    if (lower.startsWith("hi")) {
      return "hi";
    }
    if (lower.startsWith("ms")) {
      return "ms";
    }
    if (lower.startsWith("fil")) {
      return "fil";
    }
    if (lower.startsWith("my")) {
      return "my";
    }
    if (lower.startsWith("ne")) {
      return "ne";
    }
    if (lower.startsWith("si")) {
      return "si";
    }
    return "en";
  }

  function normalizeLocalePreference(locale) {
    const value = String(locale || "").trim();
    if (!value || value.toLowerCase() === "auto") {
      return "auto";
    }
    const normalized = normalizeLocale(value);
    if (SUPPORTED_LOCALE_CODES.has(normalized)) {
      return normalized;
    }
    return "auto";
  }

  function getPreferredLocale() {
    const uiLanguage =
      (globalThis.chrome?.i18n && typeof chrome.i18n.getUILanguage === "function"
        ? chrome.i18n.getUILanguage()
        : "") ||
      (typeof navigator !== "undefined" ? navigator.language || navigator.languages?.[0] || "" : "");
    return normalizeLocale(uiLanguage);
  }

  function resolveLocale(preference) {
    if (preference === "auto") {
      return getPreferredLocale();
    }
    return normalizeLocale(preference);
  }

  async function init() {
    if (initInFlight) {
      return initInFlight;
    }

    initInFlight = (async () => {
      try {
        if (globalThis.chrome?.storage?.sync?.get) {
          const values = await chrome.storage.sync.get([STORAGE_UI_LOCALE_KEY]);
          localePreference = normalizeLocalePreference(values[STORAGE_UI_LOCALE_KEY]);
        } else {
          localePreference = "auto";
        }
      } catch (_error) {
        localePreference = "auto";
      }

      activeLocale = resolveLocale(localePreference);
      return activeLocale;
    })();

    try {
      return await initInFlight;
    } finally {
      initInFlight = null;
    }
  }

  function setLocalePreference(locale) {
    localePreference = normalizeLocalePreference(locale);
    activeLocale = resolveLocale(localePreference);
    return activeLocale;
  }

  function interpolate(template, vars) {
    return String(template).replace(/\{\{(\w+)\}\}/g, (_match, key) =>
      Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : ""
    );
  }

  activeLocale = resolveLocale(localePreference);

  function t(key, vars = {}) {
    const bundle = LOCALES[activeLocale] || LOCALES.en;
    const fallback = LOCALES.en[key] ?? key;
    const template = bundle[key] ?? fallback;
    return interpolate(template, vars);
  }

  const api = {
    get locale() {
      return activeLocale;
    },
    get localePreference() {
      return localePreference;
    },
    supportedLocales: SUPPORTED_LOCALES,
    normalizeLocale,
    normalizeLocalePreference,
    init,
    setLocalePreference,
    t
  };

  globalThis.YomiRubyI18n = Object.freeze(api);
})();

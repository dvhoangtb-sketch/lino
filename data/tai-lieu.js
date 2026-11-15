/* Thư viện dạng bài tập của Lino.
   Thêm một dạng bài mới: chép một khối { ... } rồi sửa nội dung.
     nhom:   '3-5' | '6-10' | '11-15' | 'nhat'
     kynang: 'Phonics' | 'Từ vựng' | 'Nghe' | 'Đọc hiểu' | 'Viết' | 'Ngữ pháp' | 'Nói'
     nghe:   (không bắt buộc) các từ tiếng Anh để bấm nghe đọc mẫu
     tep:    (không bắt buộc) đường dẫn phiếu bài tập PDF, ví dụ 'tai-lieu/phieu-am-s.pdf'
*/
window.LINO_DOCS = [
  {
    id: 'nghe-am-chi-hinh', nhom: '3-5', kynang: 'Phonics',
    ten: 'Nghe âm, chỉ hình',
    muctieu: 'Con nghe một âm và tìm đồ vật bắt đầu bằng âm đó. Đây là bước đầu tiên của Jolly Phonics: tai nghe ra âm trước, mắt nhìn chữ sau.',
    vidu: 'Cô đọc âm /s/. Con chỉ vào hình <b>sun</b> (mặt trời) và <b>snake</b> (con rắn), bỏ qua hình <b>dog</b>.',
    nghe: ['sun', 'snake', 'sock'],
    onha: ['Chơi “Mẹ nhìn thấy một thứ bắt đầu bằng âm sss…” ngay trong nhà.', 'Đọc âm, không đọc tên chữ cái: nói “sss”, đừng nói “ét”.', 'Mỗi tối chỉ một hai âm, chơi 5 phút là đủ.']
  },
  {
    id: 'to-chu-theo-am', nhom: '3-5', kynang: 'Viết',
    ten: 'Tô chữ theo âm',
    muctieu: 'Con tô theo nét chữ của sáu âm đầu tiên s, a, t, i, p, n, vừa tô vừa đọc âm. Tay nhớ nét, miệng nhớ âm.',
    vidu: 'Tô chữ <b>s</b> bắt đầu từ trên, uốn như con rắn, vừa tô vừa kéo dài “sss”.',
    onha: ['Cho con tô bằng ngón tay lên khay cát hoặc bột mì trước khi cầm bút.', 'Khen nét đúng hướng hơn là khen chữ đẹp.', 'Tô xong, đố con tìm chữ đó trên bao bì, sách truyện.']
  },
  {
    id: 'ghep-am-doc-tu', nhom: '3-5', kynang: 'Phonics',
    ten: 'Ghép âm, đọc từ ngắn',
    muctieu: 'Con đọc từng âm rồi nói liền lại thành từ. Kỹ năng này gọi là blending, giúp con tự đọc từ mới mà không cần học thuộc.',
    vidu: '<b>s · a · t</b> đọc liền thành <b>sat</b>. <b>p · i · n</b> thành <b>pin</b>. <b>t · a · p</b> thành <b>tap</b>.',
    nghe: ['sat', 'pin', 'tap'],
    onha: ['Viết từng chữ lên mảnh giấy, đặt cách xa rồi đẩy lại gần nhau khi con đọc nhanh dần.', 'Nếu con đọc sai, đọc mẫu chậm một lần rồi cho con thử lại.', 'Bắt đầu với từ ba âm, đừng vội sang từ dài.']
  },
  {
    id: 'hat-dong-tac', nhom: '3-5', kynang: 'Nói',
    ten: 'Hát và làm động tác cho từng âm',
    muctieu: 'Mỗi âm trong Jolly Phonics có một động tác đi kèm. Con vừa nói âm vừa làm động tác, nên nhớ âm bằng cả cơ thể.',
    vidu: 'Âm /s/: tay lượn như con rắn. Âm /m/: xoa bụng “mmm” như món ăn ngon. Âm /p/: thổi tắt nến “p p p”.',
    onha: ['Nhờ con dạy lại bố mẹ động tác của âm vừa học ở lớp.', 'Đố nhau: bố mẹ làm động tác, con đoán âm.', 'Xem trang Luyện phát âm của Lino để có gợi ý động tác cho đủ 42 âm.']
  },
  {
    id: 'tach-am-chinh-ta', nhom: '6-10', kynang: 'Viết',
    ten: 'Tách âm để viết chính tả',
    muctieu: 'Ngược lại với ghép âm: con nghe một từ, tách ra từng âm rồi viết lại. Con sẽ viết đúng cả những từ chưa từng học.',
    vidu: 'Nghe <b>rain</b>, con tách thành <b>r · ai · n</b> rồi viết ra. Nghe <b>shop</b>, tách thành <b>sh · o · p</b>.',
    nghe: ['rain', 'shop', 'green'],
    onha: ['Đọc từ thật chậm, cho con giơ một ngón tay cho mỗi âm nghe được.', 'Âm đôi như <b>ai, sh, ee</b> là một âm, chỉ giơ một ngón.', 'Chấm bằng bút chì, sửa nhẹ nhàng ngay bên cạnh.']
  },
  {
    id: 'nghe-noi-ten', nhom: '6-10', kynang: 'Nghe',
    ten: 'Nghe và nối tên với người trong tranh',
    muctieu: 'Dạng bài nghe quen thuộc trong các kỳ thi Cambridge cho thiếu nhi. Con nghe mô tả, tìm đúng người trong tranh rồi nối tên.',
    vidu: '“<b>Anna</b> is the girl with the red kite.” Con tìm bạn gái cầm diều đỏ và nối tên Anna vào bạn ấy.',
    nghe: ['Anna is the girl with the red kite.'],
    onha: ['Mở một bức tranh đông người, bố mẹ mô tả một người, con chỉ ra.', 'Đổi vai: con mô tả, bố mẹ đoán.', 'Chú ý các từ chỉ màu, quần áo và hành động.']
  },
  {
    id: 'dung-sai-theo-tranh', nhom: '6-10', kynang: 'Đọc hiểu',
    ten: 'Nhìn tranh, đánh dấu đúng sai',
    muctieu: 'Con đọc một câu ngắn, nhìn tranh và đánh dấu đúng hoặc sai. Luyện đọc kỹ từng từ thay vì đoán.',
    vidu: 'Tranh một con mèo đang ngủ. Câu “<b>The cat is eating.</b>” là sai, vì mèo đang ngủ.',
    onha: ['Hỏi con “Từ nào trong câu cho con biết là sai?”', 'Tự đặt câu đúng sai về đồ vật trong phòng cho con đoán.', 'Khen khi con giải thích được lý do.']
  },
  {
    id: 'dien-tu-theo-tranh', nhom: '6-10', kynang: 'Từ vựng',
    ten: 'Điền từ còn thiếu theo tranh',
    muctieu: 'Con nhìn tranh, chọn từ đúng điền vào chỗ trống. Luyện nhớ từ vựng và viết đúng chính tả.',
    vidu: 'There is a <b>____</b> on the table. Tranh có quả táo, con điền <b>apple</b>.',
    nghe: ['There is an apple on the table.'],
    onha: ['Dán nhãn tiếng Anh lên đồ vật trong nhà một tuần.', 'Chơi “cái gì đây?” khi đi chợ, đi đường.', 'Ghi từ con hay sai vào một cuốn sổ nhỏ, ôn lại cuối tuần.']
  },
  {
    id: 'doc-truyen-tra-loi', nhom: '6-10', kynang: 'Đọc hiểu',
    ten: 'Đọc truyện ngắn, trả lời bằng một hai từ',
    muctieu: 'Con đọc một câu chuyện ngắn có tranh rồi trả lời câu hỏi bằng một hai từ. Luyện tìm ý trong bài đọc.',
    vidu: '“Tom has a dog. The dog is brown.” Hỏi: <b>What colour is the dog?</b> Con trả lời: <b>brown</b>.',
    onha: ['Đọc to cùng con, mỗi người một câu.', 'Hỏi bằng tiếng Việt trước nếu con còn bỡ ngỡ, sau đó hỏi bằng tiếng Anh.', 'Cho con gạch chân chỗ tìm được câu trả lời.']
  },
  {
    id: 'tu-kho-doc', nhom: '6-10', kynang: 'Phonics',
    ten: 'Từ khó đọc theo quy tắc',
    muctieu: 'Một số từ rất hay gặp nhưng không đọc theo quy tắc ghép âm, Jolly Phonics gọi là tricky words. Con cần nhận ra chúng ngay khi nhìn.',
    vidu: '<b>the, was, said, you, they</b>. Ví dụ “said” không đọc là “sa-id” mà đọc gần như “sed”.',
    nghe: ['the', 'was', 'said', 'you', 'they'],
    onha: ['Viết mỗi từ lên một thẻ, dán ở chỗ con hay nhìn.', 'Chơi lật thẻ: con đọc đúng thì được giữ thẻ.', 'Mỗi tuần chỉ thêm hai ba từ mới.']
  },
  {
    id: 'doc-hieu-chon-dap-an', nhom: '11-15', kynang: 'Đọc hiểu',
    ten: 'Đọc đoạn văn, chọn đáp án đúng',
    muctieu: 'Con đọc một đoạn văn dài hơn và chọn đáp án A, B hoặc C. Luyện đọc lướt tìm ý chính và đọc kỹ tìm chi tiết.',
    vidu: 'Đọc câu hỏi trước, gạch chân từ khoá, rồi tìm từ khoá đó trong bài. Đáp án đúng thường được nói lại bằng từ khác.',
    onha: ['Hỏi con “Đoạn này nói về điều gì?” trước khi làm câu hỏi.', 'Khi con chọn sai, cùng tìm câu trong bài chứng minh đáp án đúng.', 'Bấm giờ nhẹ nhàng để con quen với áp lực thời gian.']
  },
  {
    id: 'viet-truyen-theo-tranh', nhom: '11-15', kynang: 'Viết',
    ten: 'Viết đoạn văn kể chuyện theo tranh',
    muctieu: 'Con nhìn ba bức tranh liền nhau và viết một câu chuyện ngắn. Luyện dùng thì quá khứ và từ nối câu.',
    vidu: 'Dùng từ nối: <b>First</b>, <b>Then</b>, <b>Finally</b>. “First, Ben went to the park. Then it started to rain. Finally, he ran home.”',
    nghe: ['First, Ben went to the park. Then it started to rain. Finally, he ran home.'],
    onha: ['Cho con kể bằng lời trước, viết sau.', 'Đếm xem con dùng được bao nhiêu động từ quá khứ.', 'Khen một câu hay nhất trước khi sửa lỗi.']
  },
  {
    id: 'chia-dong-tu', nhom: '11-15', kynang: 'Ngữ pháp',
    ten: 'Chia động từ theo thì',
    muctieu: 'Dạng bài hay gặp trên trường: điền dạng đúng của động từ trong ngoặc. Luyện nhận ra dấu hiệu của từng thì.',
    vidu: 'I <b>(visit)</b> my grandma last Sunday. Có “last Sunday” nên dùng quá khứ: <b>visited</b>.',
    onha: ['Lập bảng nhỏ: dấu hiệu nhận biết của từng thì con đã học.', 'Cho con tự đặt câu về chính ngày hôm nay của mình.', 'Ôn động từ bất quy tắc mỗi ngày năm từ.']
  },
  {
    id: 'nghe-dien-thong-tin', nhom: '11-15', kynang: 'Nghe',
    ten: 'Nghe và điền thông tin',
    muctieu: 'Con nghe một đoạn hội thoại và điền tên, số, ngày giờ vào phiếu. Luyện nghe chi tiết và đánh vần.',
    vidu: '“My name is Jack, J, A, C, K. The class starts at <b>half past three</b>.” Con điền: Jack, 3:30.',
    nghe: ['My name is Jack. J, A, C, K. The class starts at half past three.'],
    onha: ['Đọc số điện thoại, ngày sinh bằng tiếng Anh cho con chép lại.', 'Luyện đánh vần tên các thành viên trong nhà.', 'Nghe lại lần hai để con tự kiểm tra.']
  },
  {
    id: 'noi-mo-ta-tranh', nhom: '11-15', kynang: 'Nói',
    ten: 'Nói: mô tả tranh và nêu ý kiến',
    muctieu: 'Con nhìn một bức tranh, nói xem có gì, ai đang làm gì, rồi nói mình thích hay không và vì sao.',
    vidu: '“In this picture, I can see two children. They are playing football. I like this picture <b>because</b> it looks fun.”',
    nghe: ['In this picture, I can see two children. They are playing football.'],
    onha: ['Mỗi tối chọn một bức ảnh trong điện thoại, con tả trong một phút.', 'Nhắc con dùng “because” để nói lý do.', 'Ghi âm lại để con tự nghe và sửa.']
  },
  {
    id: 'bang-chu-nhat', nhom: 'nhat', kynang: 'Viết',
    ten: 'Đọc và viết bảng chữ Hiragana, Katakana',
    muctieu: 'Bước đầu tiên của N5: đọc thuộc và viết đúng thứ tự nét hai bảng chữ mềm và chữ cứng.',
    vidu: '<span lang="ja">あ い う え お</span> đọc là a, i, u, e, o. Cùng âm đó viết bằng Katakana: <span lang="ja">ア イ ウ エ オ</span>.',
    onha: ['Học mỗi ngày một hàng năm chữ, ôn lại hàng hôm trước.', 'Viết tên mình bằng Katakana để nhớ lâu.', 'Đọc nhãn hàng Nhật trong siêu thị để luyện mắt.']
  },
  {
    id: 'tro-tu', nhom: 'nhat', kynang: 'Ngữ pháp',
    ten: 'Điền trợ từ は, が, を, に',
    muctieu: 'Trợ từ là phần dễ nhầm nhất khi mới học. Dạng bài cho câu có chỗ trống, người học chọn trợ từ đúng.',
    vidu: '<span lang="ja">わたし（は）がくせいです。</span> Tôi là học sinh. <span lang="ja">パン（を）たべます。</span> Tôi ăn bánh mì.',
    onha: ['Ghi mỗi trợ từ kèm hai câu mẫu vào sổ.', 'Tự đặt câu về việc mình làm trong ngày.', 'Đọc to cả câu, đừng chỉ đọc trợ từ.']
  },
  {
    id: 'nghe-chon-tranh-nhat', nhom: 'nhat', kynang: 'Nghe',
    ten: 'Nghe hội thoại ngắn, chọn tranh',
    muctieu: 'Dạng bài nghe của kỳ thi JLPT N5: nghe một đoạn hội thoại ngắn rồi chọn bức tranh đúng.',
    vidu: 'Nghe <span lang="ja">「りんごを ふたつ ください。」</span> (Cho tôi hai quả táo). Chọn tranh có hai quả táo.',
    onha: ['Đọc câu hỏi và nhìn tranh trước khi nghe.', 'Chú ý số đếm, ngày giờ và vị trí.', 'Nghe lại lần hai, che phần chữ để luyện tai.']
  },
  {
    id: 'kanji-n5', nhom: 'nhat', kynang: 'Từ vựng',
    ten: 'Đọc Kanji N5',
    muctieu: 'Nhận mặt các chữ Kanji cơ bản và biết cách đọc trong từ thường gặp.',
    vidu: '<span lang="ja">日</span> trong <span lang="ja">日本</span> đọc là <span lang="ja">に</span>, trong <span lang="ja">日よう日</span> đọc là <span lang="ja">にち</span> và <span lang="ja">び</span>.',
    onha: ['Học Kanji theo từ, không học từng chữ rời.', 'Mỗi ngày năm chữ, viết ba lần mỗi chữ.', 'Ôn bằng thẻ: mặt trước chữ, mặt sau cách đọc và nghĩa.']
  }
];

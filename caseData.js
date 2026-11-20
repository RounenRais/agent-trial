function document(id, title, source, relatedIds, content) {
  return {
    id,
    title,
    source,
    relatedIds,
    content
  };
}

const caseData = {
  id: "PX41-TRANSFER",

  title: "PX-41 Dış Test Aktarımı",

  description: `
    Bu kurmaca davada MaviHat mühendisi Deniz, 14 Ekim 2026'da
    PX-41 prototipini ve hazırladığı dijital arşivi, şirketin
    çalıştığı KuzeyTest laboratuvarına gönderdi.

    Kimlik ve aktarım eylemi iki tarafça kabul ediliyor.
    Prototip ertesi gün döndü.

    Şirket, Deniz'in test iznini bilerek aşarak korumalı üretim
    verilerini dışarı aktardığını ileri sürüyor.
    Deniz izinli test paketi hazırladığını savunuyor.

    KuzeyTest'in Deniz'e yaptığı kişisel ödeme kabul ediliyor;
    amacı tartışmalı.

    İzin kapsamı, paketin içeriği, yapılandırma değişikliği
    ve kasıt delillerle tartışılacak.

    Suçlama başlangıçta doğru kabul edilmez.
    Simülasyon, iki tarafın sunulan kayıtları açıklama gücünü
    karşılaştırır.
  `,

  evidence: [
    document(
      "E1",
      "Prototip ve USB teslim tutanağı",
      "Güvenlik teslim masası / 14 Ekim 2026 17.06",
      ["E3", "E5", "E7", "E9"],
      `
        Deniz, PX-41-A prototipini ve U-18 USB belleğini
        yetkili KuzeyTest kuryesine 17.06'da teslim etti.
        Tutanak iki tarafça imzalandı.
        Amaç alanında 'KT-117 dış kalibrasyon testi' yazıyor.
        Güvenlik seri numarasını kontrol etti;
        USB içeriğini açmadı.
      `
    ),

    document(
      "E2",
      "Dış test ve veri sınıflandırma politikası",
      "Şirket politikası POL-12 / Olay tarihinde yürürlükte",
      ["E3", "E4", "E6", "E10", "E11"],
      `
        Proje yöneticisi prototip ve S sınıfı sentetik test
        verilerinin dış laboratuvara gönderilmesini onaylayabilir.

        Gerçek üretim parametreleri R sınıfıdır; aktarımı için
        veri sorumlusunun içeriği veya kapsamı belirten yazılı
        onayı gerekir.

        Sınıf, dosya adına göre değil içeriğe göre belirlenir.
        Gizlilik sözleşmesi ayrıca gereken veri izninin
        yerine geçmez.
      `
    ),

    document(
      "E3",
      "Proje yöneticisinin dış test onayı",
      "Selin'in kurumsal e-postası / 14 Ekim 2026 14.10",
      ["E1", "E2", "E4", "E6"],
      `
        Selin'in Deniz'e e-postası:

        'PX-41'i KT-117 için KuzeyTest'e gönderebilirsin.
        Standart kalibrasyonun gerektirdiği test eklerini de koy.
        Yarınki gösterime yetişmesi önemli.'

        E-postada dosya listesi bulunmuyor.
        Selin proje yöneticisi; R sınıfı veri sorumlusu Ece.
      `
    ),

    document(
      "E4",
      "Veri sorumlusunun izin kapsamı mesajı",
      "Ece'nin kurumsal mesajı / 14 Ekim 2026 15.02",
      ["E2", "E3", "E10", "E19"],
      `
        Ece'nin Deniz'e mesajı:

        'Standart test kopyaları için önceki onay geçerli.
        Gerçek üretim parametrelerini eklemeyin;
        onlar için ayrıca konuşmamız gerekir.'

        Mesaj Deniz'in hesabında 15.07'de açıldı.
        Önceki yazışmadaki onay sentetik kalibrasyon
        örneklerine ait.
      `
    ),

    document(
      "E5",
      "Gönderilen arşivin hazırlama manifestosu",
      "Paketleme işlem kaydı / 14 Ekim 2026 16.50",
      ["E1", "E10", "E11", "E15", "E20"],
      `
        Deniz'in hesabında 16.50'de PX41_KT117.zip oluşturuldu.
        Arşiv kimliği A-741.

        İçindekiler:
        firmware-test.bin
        production-map-v7.csv
        readme-test.md

        Profil: prod-compatible.
        Önayar: KT-standard.

        İşlem günlüğünde etkin önayar sürümü ve
        veri kaynağı alanları tutulmamış.
      `
    ),

    document(
      "E6",
      "KuzeyTest iş emri ve gizlilik eki",
      "KT-117 hizmet sözleşmesi / 12 Ekim 2026",
      ["E2", "E3", "E9", "E15", "E17"],
      `
        KT-117; kalibrasyon ve arayüz uyumluluk testidir.
        Cihazla birlikte bir kalibrasyon tablosu gerekir;
        gerçek üretim değerleri şart değildir.

        Gizlilik eki başka müşterilere aktarımı yasaklar.
        Yetkili teknik alt yükleniciler KuzeyTest
        sorumluluğunda hizmet verebilir.
      `
    ),

    document(
      "E7",
      "Teslim anının kamera incelemesi",
      "Güvenlik inceleme tutanağı / 14 Ekim 2026",
      ["E1", "E24"],
      `
        Kamerada 17.06'da Deniz, kutuyu ve USB zarfını kimliği
        doğrulanan KuzeyTest kuryesine veriyor.

        Teslim, güvenlik masasının önünde gerçekleşiyor.
        İncelenen görüntü aralığında başka bir kişiye
        ikinci teslim görülmüyor.
      `
    ),

    document(
      "E8",
      "Laboratuvar portalına yükleme kaydı",
      "Şirket ağ geçidi ve laboratuvar portalı / 14 Ekim 17.24",
      ["E5", "E6", "E15", "E17"],
      `
        17.24'te Deniz'in hesabından KuzeyTest'in doğrulanmış
        KT-117 portalına A-741 arşivi yüklendi.
        Arşiv kimliği USB manifestosuyla aynı.

        Bu ağ geçidinin günlüklerinde başka alıcıya
        ikinci aktarım yok.
        Günlüğün kapsamı bu ağ geçidiyle sınırlı.
      `
    ),

    document(
      "E9",
      "Prototipin dönüş teslimi",
      "Şirket kabul masası / 15 Ekim 2026 16.35",
      ["E1", "E6", "E18", "E22"],
      `
        PX-41-A ve U-18 ertesi gün 16.35'te şirkete döndü.
        Cihaz çalışır durumda ve seri numarası aynı.

        Teslimde USB'nin tam imajı alınmadı.
        KT-117 test raporu cihazla birlikte geldi.
      `
    ),

    document(
      "E10",
      "Paketleme aracı kullanım kılavuzu",
      "Teknik dokümantasyon / Olay tarihinde geçerli",
      ["E2", "E5", "E11", "E19", "E20"],
      `
        prod-compatible, üretimle aynı dosya adlarını
        ve sütunları kullanır.

        KT-standard v12 sentetik değer üretir;
        18.032 satırlık şemayı korur.

        Sentetik üretimde bazı genel kalibrasyon sabitleri
        değişmez, diğer üretim değerleri dönüştürülür.

        Veri kaynağını etkin önayar ve ortam ayarları belirler.
        Kabul sistemi yalnızca biçim denetler.
      `
    ),

    document(
      "E11",
      "Ana üretim tablosunun sınıflandırma kaydı",
      "Veri envanteri / Son güncelleme 9 Ekim 2026",
      ["E2", "E5", "E10", "E15", "E16"],
      `
        Ana production-map-v7.csv R sınıfı,
        18.032 satırlık üretim tablosudur.

        İncelemeye alınan üç referans hücrenin değerleri
        son üretim serisine özgüdür.

        Aynı hücrelerin onaylı v12 sentetik çıktısındaki
        değerleri farklıdır.

        Bu üç referans, kamuya açık örnek tabloda bulunmuyor.
      `
    ),

    document(
      "E12",
      "Deniz'e yapılan kişisel ödeme",
      "Banka hareketi / 15 Ekim 2026 09.20",
      ["E13", "E14", "E23"],
      `
        15 Ekim 09.20'de KuzeyTest'ten Deniz'in kişisel
        hesabına 85.000 TL yatırıldı.

        Açıklama: 'yazılım danışmanlığı'.

        Şirketin KuzeyTest'e ödediği KT-117 hizmet bedeli
        ayrı işlem.

        Banka kaydında sözleşme veya iş emri numarası yok.
      `
    ),

    document(
      "E13",
      "Önceki danışmanlık sözleşmesi",
      "İmzalı sözleşme / 20 Ağustos 2026",
      ["E12", "E14", "E23"],
      `
        20 Ağustos tarihli sözleşme, KuzeyTest'in eski ölçüm
        cihazına raporlama betiği geliştirilmesini kapsıyor.

        Ücret 85.000 TL, teslim tarihi 14 Ekim.

        Sözleşme, Ağustos tarihli iki taraflı
        e-posta eklerinde mevcut.

        İmzalı iş kabul belgesi bu dosyada yok.
      `
    ),

    document(
      "E14",
      "Danışmanlık faturası ve oluşturulma kaydı",
      "KuzeyTest mali sistemi / 15 Ekim 2026",
      ["E12", "E13", "E23"],
      `
        Eski ölçüm cihazı betiği için 85.000 TL fatura
        15 Ekim 08.55'te oluşturuldu.

        Hizmet tarihi 14 Ekim;
        atıf Ağustos sözleşmesine.

        Dosyanın oluşturulma kaydı ödeme saatinden
        25 dakika önce.

        Fatura ekinde teslim edilen betiğin sürüm kimliği yok.
      `
    ),

    document(
      "E15",
      "Laboratuvar arşiv kabul raporu",
      "KuzeyTest kabul sistemi / 14 Ekim 2026 17.26",
      ["E5", "E10", "E11", "E16", "E22"],
      `
        17.26 kabul raporu A-741 içinde 18.032 satırlık
        tablo bulunduğunu gösteriyor.

        Sistem, arşivin 20 hücresini örnek olarak kaydetmiş.

        Bunlardan üçü E11'deki son üretim serisine özgü
        referans değerleriyle birebir eşleşiyor ve
        onaylı v12 sentetik çıktısından farklı.

        Diğer 17 hücre için karşılaştırma raporu yok.
        Orijinal arşivin tamamı dava paketine eklenmemiş.
      `
    ),

    document(
      "E16",
      "İç denetçinin ön sızıntı değerlendirmesi",
      "İç denetim ön raporu / 15 Ekim 2026",
      ["E5", "E10", "E11", "E15"],
      `
        Denetçi; dosya adı, satır sayısı ve üç hücre
        eşleşmesini gerekçe göstererek üretim verisi
        aktarımı şüphesi bildirdi.

        Rapor E5, E11 ve E15'e dayanıyor;
        yeni bir arşiv incelemesi yapılmadı.

        Özet sayfasında 'üretim tablosu dışarı çıktı'
        ifadesi kullanılmış.
      `
    ),

    document(
      "E17",
      "Dış teknik destek hesabının erişimi",
      "Portal erişim özeti / 14 Ekim 2026 17.42",
      ["E6", "E8", "E15", "E22"],
      `
        remote-23 teknik destek hesabı 17.42'de KT-117
        dosya listesini ve kabul durumunu görüntüledi.

        Hesap sahibi daha önce MaviHat'ın rakibine de
        hizmet veren bağımsız uzman.

        Portal özetinde CSV indirme yok.
        Laboratuvar makinelerinin yerel dosya günlükleri
        bu özette yer almıyor.
      `
    ),

    document(
      "E18",
      "Yerel hazırlama klasörünün temizlenmesi",
      "Deniz'in iş istasyonu günlüğü / 14 Ekim 2026 17.58",
      ["E5", "E8", "E9", "E19"],
      `
        Deniz, 17.58'de hazırlama klasörünü temizleyen
        komutu elle çalıştırdı.

        Yerel hazırlama kopyaları silindi;
        ana veri deposu silinmedi.

        Prosedür bu kopyaların yedi gün saklanmasını öneriyor.
        Merkezî manifesto ve kabul raporu kaldı.

        Komut kaydında gerekçe bulunmuyor.
      `
    ),

    document(
      "E19",
      "Önceki yanlış veri kaynağı uyarısı",
      "Teknik destek kaydı / 30 Eylül–2 Ekim 2026",
      ["E4", "E10", "E18", "E20", "E21"],
      `
        30 Eylül destek kaydı:
        Bazı ortamlarda KT-standard üretim kaynağına dönebiliyor.

        2 Ekim çözüm notu:
        'v12 sentetik kaynakla doğrulandı;
        gönderim öncesi etkin kaynak kontrolü yapılmalı.'

        Deniz notu aynı gün açtı.

        14 Ekim gönderimine ait imzalı kaynak
        kontrol formu bulunamadı.
      `
    ),

    document(
      "E20",
      "KT-standard önayarının değişiklik kaydı",
      "Yapılandırma sunucusu / 14 Ekim 2026 13.40",
      ["E5", "E10", "E19", "E21"],
      `
        Bora, 14 Ekim 13.40'ta KT-standard v13'ü yayımladı.

        v12 doğrudan sentetik kaynak seçiyordu.
        v13 ortamda tanımlı kaynağı, ortam tanımı yoksa
        önceki yerel ayarı kullanıyor.

        Dağıtım otomatik; Deniz'in makinesinin güncellemeyi
        alma saati kayıtta yok.

        Değişiklik kaydında Deniz onayı bulunmuyor.
      `
    ),

    document(
      "E21",
      "Bora'nın yapılandırma değişikliği ifadesi",
      "İmzalı çalışan ifadesi / 16 Ekim 2026",
      ["E19", "E20", "E23"],
      `
        Bora'nın ifadesi:

        'Farklı test makinelerini desteklemek için
        v13'ü yayımladım.

        Deniz'e ayrıca haber vermedim;
        onun v12 ile devam ettiğini düşündüm.
        Makinesini kontrol etmedim.'

        Bora yapılandırma sürecinden sorumlu ve şirketin
        aynı olayla ilgili iç incelemesine dahil.
      `
    ),

    document(
      "E22",
      "Laboratuvar mühendisinin açıklaması",
      "Aslı'nın imzalı ifadesi / 16 Ekim 2026",
      ["E6", "E15", "E17"],
      `
        Aslı'nın ifadesi:

        'Tabloyla kalibrasyonu tamamladık.
        Değerlerin gerçek üretim mi sentetik mi
        olduğunu bilmiyorum.

        remote-23 biçim sorunu için destek verdi.
        Başka müşteriye paket göndermedik.'

        Aslı KT-117 ekibinde görevli.
        İfadesine tüm laboratuvar makinelerini kapsayan
        teknik inceleme eklenmemiş.
      `
    ),

    document(
      "E23",
      "Deniz ile KuzeyTest arasındaki mesaj dizisi",
      "Kurumsal mesaj dışa aktarımı / 13–14 Ekim 2026",
      ["E5", "E12", "E13", "E14", "E21"],
      `
        KuzeyTest çalışanı:
        'Dosya ulaşınca ücreti kapatalım.'

        Deniz:
        'Yarın hem test paketini hem eski işi teslim edeceğim.'

        Dizide KT-117 ve Ağustos danışmanlığına ait
        ekler birlikte bulunuyor.

        Ücret cümlesinde dosya kimliği veya
        iş numarası belirtilmiyor.
      `
    ),

    document(
      "E24",
      "Güvenlik ihbarının tam tutanağı",
      "İlk ihbar ve sonraki ifade / 14–15 Ekim 2026",
      ["E1", "E3", "E7", "E16"],
      `
        İlk güvenlik ihbarı:
        'Deniz prototipi dışarı çıkardı; izin durumunu bilmiyorum.'

        Yönetim özetinde:
        'İzinsiz prototip çıkışı.'

        Görevli sonraki ifadesinde gönderim onaylarına
        erişmediğini söyledi.

        İlk ihbar, yönetim özeti ve sonraki ifade
        aynı görevlinin gözleminden kaynaklanıyor.
      `
    )
  ]
};

module.exports = caseData;
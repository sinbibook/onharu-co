$(document).ready(function () {
  // Initialize AOS
  AOS.init({
    once: true,
    duration: 2000,
  });

  // const locomotiveScroll = new LocomotiveScroll();

  // Swiper 초기화 함수
  function initSwiper(container, options) {
    if (container.length) {
      return new Swiper(container.find(".swiper-container")[0], options);
    }
  }

  // con0은 header-footer-loader.js에서 동적 슬라이드 생성 후 초기화

  initSwiper($(".con3"), {
    slidesPerView: 1,
    loop: $(".con3 .swiper-slide").length > 1, // 슬라이드 부족 시 loop 비활성 (Swiper 경고 방지)
    effect: "fade",
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: $(".con3 .swiper-button-next")[0],
      prevEl: $(".con3 .swiper-button-prev")[0],
    },
  });

  // con4는 각 mapper (header-footer-loader.js, facility-mapper.js)에서 초기화

  $(".header .btnMenu").on("click", function () {
    $(".header .menu").toggleClass("active");
  });
  $(".header .menuClose").on("click", function () {
    $(".header .menu").toggleClass("active");
  });

  // con2(.imgRolling) 롤링은 각 페이지 mapper에서 이미지 매핑 직후 초기화한다.
  // (페이지 로드 시점엔 컨테이너가 비어 있어 복제가 안 됨 → index에서 여백 발생하던 버그)
  // index: IndexMapper.initializeRolling, main: MainMapper.initializeRolling

  $(".header .menu .depth_1 > a").on("click", function (e) {
    e.preventDefault();

    $(this).parent().toggleClass("active");
  });

  function animateSentences($el) {
    $el.find(".__sentence").each(function (i) {
      var $sentence = $(this);
      gsap.set($sentence.find("span"), {
        y: "150%",
        skewY: 30,
      });
      gsap.to($sentence.find("span"), {
        y: "0%",
        skewY: 0,
        delay: i * 0.1,
        duration: 3,
        ease: "power2.out",
        stagger: {
          amount: 0.5,
          from: "start",
        },
      });
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var $el = $(entry.target);
          animateSentences($el);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  $(".__anim-sentence").each(function () {
    observer.observe(this);
  });
});

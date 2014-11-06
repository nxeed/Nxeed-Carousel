(function($) {
    var defaults = {
        slideWidth: 'auto',
        slideHeight: 'auto',
        margin: 8,
        items: 4,
        easing: 'linear',
        animationSpeed: 400,
        dragable: false,
        mousewheel: false,
        autoplay: 5000,
        vertical: false,
        slider: {next: 'Next', prev: 'Prev'},
        pagination: false
    };

    var methods = {
        init: function(params) {

            var $this = $(this);

            if (this.data('nbc')) {
                return;
            }

            var options = $.extend({}, defaults, params);
            var container = $('.nbc-container', this);
            var wrapper = $('.nbc-wrapper', this);
            var slides = $('.nbc-slide', this);
            var count = slides.length;

            // Размер слайдов

            if (options.slideWidth === 'auto') {
                options.slideWidth = $(slides[0]).outerWidth();
            }

            if (options.slideHeight === 'auto') {
                options.slideHeight = $(slides[0]).outerHeight();
            }

            // Позиция слайдов

            $.each(slides, function(num, slide) {
                if (options.vertical) {

                    var offset = options.slideHeight * num + options.margin * num;

                    $(slide).css({
                        top: offset
                    });
                } else {
                    var offset = options.slideWidth * num + options.margin * num;

                    $(slide).css({
                        left: offset
                    });
                }
            });

            // Размер контейнера

            if (options.vertical) {

                var containerHeight = options.slideHeight * options.items + options.margin * (options.items - 1);
                container.css({
                    width: options.slideWidth,
                    height: containerHeight
                });
            } else {
                var containerWidth = options.slideWidth * options.items + options.margin * (options.items - 1);
                container.css({
                    width: containerWidth,
                    height: options.slideHeight
                });
            }

            // Двусторонняя навигация

            if (options.slider) {
                var prevTitle = typeof (options.slider) === 'object' ? options.slider.prev : '';
                var nextTitle = typeof (options.slider) === 'object' ? options.slider.next : '';

                var slider = $('<div class="nbc-slider"><a href="#" class="nbc-control nbc-prev"><span>' + prevTitle + '</span></a> <a href="#" class="nbc-control nbc-next"><span>' + nextTitle + '</span></a></div>');
                this.append(slider);

                $('.nbc-prev', this).bind('click.nbc', function(e) {
                    e.preventDefault();
                    $this.nbc('set', $this.data('page') - 1);
                });

                $('.nbc-next', this).bind('click.nbc', function(e) {
                    e.preventDefault();
                    $this.nbc('set', $this.data('page') + 1);
                });
            }

            // Пагинация

            if (options.pagination) {
                var pagination = $('<ul class="nbc-pagination"></ul>');
                var pages = count - options.items;
                for (var i = 0; i <= pages; i++) {
                    var item = $('<li class="page-' + i + '"><a href="#"><span>' + (i + 1) + '</span></a></li>');
                    pagination.append(item);

                    item.bind('click.nbc', function(e) {
                        e.preventDefault();
                        $this.nbc('set', $(this).find('span').text() - 1);
                    });
                }

                this.append(pagination);
            }

            // Автоплэй

            if (options.autoplay) {
                var autoplay;
                var autoplayAction = function() {
                    $this.nbc('set', $this.data('page') + 1);
                };

                var setAutoplay = function() {
                    autoplay = setInterval(autoplayAction, options.autoplay);
                };

                this.bind({
                    'mouseenter.nbc': function(e) {
                        clearInterval(autoplay);
                    },
                    'mouseleave.nbc': function(e) {
                        setAutoplay();
                    }
                });

                setAutoplay();
            }

            // Дрэг

            if (options.dragable) {
                var currentOffset;

                container.bind('dragstart.nbc', function(ev, dd) {
                    $this.data('dragging', true);
                    $this.addClass('nbc-dragging');

                    if (options.vertical) {
                        currentOffset = parseInt(wrapper.css('top'));
                    } else {
                        currentOffset = parseInt(wrapper.css('left'));
                    }

                }).bind('drag.nbc', function(ev, dd) {

                    if (options.vertical) {
                        wrapper.stop(true, false).css({
                            top: currentOffset + dd.deltaY / 24
                        });
                    } else {
                        wrapper.stop(true, false).css({
                            left: currentOffset + dd.deltaX / 24
                        });
                    }

                }).bind('dragend.nbc', function(ev, dd) {
                    if (options.vertical) {
                        $this.nbc('set', (dd.deltaY < 0) ? $this.data('page') + 1 : $this.data('page') - 1);
                    } else {
                        $this.nbc('set', (dd.deltaX < 0) ? $this.data('page') + 1 : $this.data('page') - 1);
                    }

                    setTimeout(function() {
                        $this.data('dragging', false);
                        $this.removeClass('nbc-dragging');
                    }, 200);
                });

                $('a', container).bind('click.nbc', function(e) {
                    var dragging = $this.data('dragging');

                    if (dragging) {
                        e.preventDefault();
                    }
                });
            }

            // Колёсико

            if (options.mousewheel) {
                var mousewheelAction = function(e) {
                    e.preventDefault();
                    $this.nbc('set', (e.deltaY > 0) ? $this.data('page') + 1 : $this.data('page') - 1);
                };
                container.bind('mousewheel.nbc', mousewheelAction);

                if (options.pagination) {
                    pagination.bind('mousewheel.nbc', mousewheelAction);
                }
            }

            // Сохраняем данные

            this.data({
                options: options,
                page: 0,
                count: count,
                items: options.items,
                wrapper: wrapper,
                nbc: true,
                autoplay: autoplay
            });

            $this.nbc('set', 0);
        },
        set: function(page) {

            var options = this.data('options');
            var count = this.data('count');
            var items = this.data('items');
            var wrapper = this.data('wrapper');

            var limit = count - items;

            // Не даем выходить за пределы количества страниц

            if (page < 0) {
                page = limit;
            } else if (page > limit) {
                page = 0;
            }

            // Запускаем перелистывание

            if (options.vertical) {
                var offset = -1 * options.slideHeight * page - options.margin * page;

                wrapper.stop(true, false).animate({
                    top: offset
                }, {
                    duration: options.animationSpeed,
                    easing: options.easing
                });
            } else {
                var offset = -1 * options.slideWidth * page - options.margin * page;

                wrapper.stop(true, false).animate({
                    left: offset
                }, {
                    duration: options.animationSpeed,
                    easing: options.easing
                });
            }

            // Обновляем пагинатор
            
            if (options.pagination) {
                var pagination = this.find('.nbc-pagination');
                var active = pagination.find('.active');

                if (active.length > 0) {
                    active.removeClass('active');
                }

                pagination.find('.page-' + page).addClass('active');
            }

            // Сохраняем текущую страницу
            
            this.data('page', page);
        }
    };

    $.fn.nbc = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist for jQuery.nbc");
        }
    };
})(jQuery);

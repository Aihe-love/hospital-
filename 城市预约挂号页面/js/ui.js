// ui-search 定义
$.fn.UiSearch = function () {
    let ui = $(this);
    $('.ui-search-selected', ui).on('click', function (e) {
        $('.ui-search-select-list').show();

        //  可以阻止事件冒泡
        return false;
    })

    $('.ui-search-select-list a', ui).on('click', function () {
        $('.ui-search-selected').text($(this).text());
        $('.ui-search-select-list').hide();

        return false;
    })

    $('body').on('click', function () {
        $('.ui-search-select-list').hide();
    })
}


// ui-tab 定义
$.fn.UiTab = function (header, content, focus_prefix) {
    /*
        @param  {string}  header  tab组件 的所有选项卡 .item
        @param  {string}  content  tab 组件的 内容区域 所有item
        @options  {string}  focus_prefix  选项卡高亮样式前缀，可选，默认item.focus
    */

    let ui = $(this);
    let tabs = $(header, ui);
    let cons = $(content, ui);
    let focusPrefix = focus_prefix || '';

    tabs.on('click', function () {
        let index = $(this).index();
        tabs.removeClass(focusPrefix + 'item_focus').eq(index).addClass(focusPrefix + 'item_focus')
        cons.hide().eq(index).show();
        return false;
    })
}

// ui-backTop
$.fn.UiBackTop = function () {
    let ui = $(this);
    let el = $('<a class="ui-backTop" href="javascript:;"></a>')
    ui.append(el);
    let windowHeight = $(window).height();
    $(window).on('scroll', function () {
        let top = $(window).scrollTop();
        if (top > windowHeight) {
            el.show()
        } else {
            el.hide()
        }
    })
    el.on('click', function () {
        $(window).scrollTop(0);
    })
}


// ui-slider
$.fn.UiSlider = function () {
    // 1.左右箭头需要能控制翻页
    // 2.翻页的时候，进度点，要联动
    // 3.翻到第三页的时候，下一页需要回到第一页，翻到第一页的时候，同理
    // 4.进度点，在点击的时候，需要切换到对应的页面
    // 5.没有 (进度点点击、翻页操作) 的时候需要进行自动滚动
    // 6.滚动过程中，屏蔽其他操作(自动滚动、左右翻页、进度点点击)
    let ui = $(this);
    let wrap = $('.ui-slider-wrap');
    let items = $('.ui-slider-wrap .item', ui);
    let btn_prev = $('.ui-slider-arrow .left', ui);
    let btn_next = $('.ui-slider-arrow .right', ui);
    let tips = $('.ui-slider-process .item', ui);


    // 预定义
    let current = 0;
    let size = items.length;
    let width = items.eq(0).width();
    let timer = null;
    // let flag = true;


    // 设置轮播感应
    ui.on({
        'mouseover': function () {
            clearInterval(timer)
            // flag = false;
        },
        'mouseout': function () {
            timer = setInterval(function () {
                wrap.triggerHandler('move_next');
            }, 2000)
            // flag = true;
        }
    })


    // 具体操作
    wrap.on({
        'move_prev': function () {

            if (current <= 0) {
                current = size
            }
            current--;

            wrap.triggerHandler('move_to');

        },
        'move_next': function () {
            current++;
            if (current >= size) {
                current = 0
            }

            wrap.triggerHandler('move_to');

        },
        'move_to': function () {
            wrap.css('left', -(current * width))
            tips.removeClass('item_focus').eq(current).addClass('item_focus')
        },
        'auto_move': function () {
            timer = setInterval(function () {
                // flag && wrap.triggerHandler('move_next');
                wrap.triggerHandler('move_next');
            }, 2000)
        }
    }).triggerHandler('auto_move')

    // 事件
    btn_prev.on('click', function () {
        // triggerHandler触发自定义事件，jquery封装好的
        wrap.triggerHandler('move_prev')
    })
    btn_next.on('click', function () {
        wrap.triggerHandler('move_next')
    })
    tips.on('click', function () {
        current = $(this).index();
        wrap.triggerHandler('move_to')
    })
}


// ui-cascading
$.fn.UiCascading = function () {
    let ui = $(this);
    let selects = $('select',ui);
    selects.on({
        'change':function () {
            let val = $(this).val();
            let index = selects.index($(this));

            // 触发下一个 select 的更新，根据当前的值
            let where = $(this).attr('data-where');
            where = where ? where.split(',') : [];
            where.push($(this).val())

            selects.eq(index+1).attr('data-where',where.join(',')).triggerHandler('reloadOptions')

            // 触发下一个之后的 select  的初始化(清除不应该的数据项)
            ui.find('select:gt('+(index+1)+')').each(function () {
                $(this).attr('data-where','').triggerHandler('reloadOptions')
            });
        },
        // 自定义事件
        'reloadOptions':function () {
            let method = $(this).attr('data-search');
            let area = $(this).attr('data-where').split(',');
            let data = AjaxRemoteGetData[method].apply(this,area);
            let select = $(this);
            select.find('option').remove();
            $.each( data, function (i,item) {
                let el = $('<option value="'+item+'">'+item+'</option>')
                select.append(el);
            })
        }
    })
    selects.eq(0).triggerHandler('reloadOptions')
}


// 页面的脚本逻辑
$(function () {
    $('.ui-search').UiSearch();
    $('.content__tab').UiTab('.caption > .item', '.block > .item')
    $('.content__tab .block .item').UiTab('.block__caption > .block__caption__item', '.block__content > .block__content__item', 'block__caption__')
    $('body').UiBackTop();
    $('.ui-slider').UiSlider();
    $('.ui-cascading').UiCascading();
})

/**
 * How to use this:
 *
 * Auto start:  To auto start this module, ensure the html attr data-scroll is
 *
 * Manually
 * Just run include this file and everything will be done for you.
 * If you expirience any issues, you can adjust the configuration with acrontum.smoothScroll.start({idHolder: 'section', top: 'body'}); or something similar.
 *
 * Manually pure scoll
 * acrontum.smoothScroll.scrollIntoView( '.someclass', 100, 500, function(){
 *      //some function
 * } );
 */
if(typeof acrontum === 'undefined') {
    var acrontum = {};
}
acrontum.smoothScroll = {
    variables: {
        ignoreNextPopChange: true,
        dontUseHistory: false,
        idHolder: "section",
        top: $('body').children().not(".navbar, nav, [role='navigation']").first(),
        stateCollection: []
    },

    /**
     * initiates the library
     */
    init: function() {
        acrontum.smoothScroll.setConfiguration().then(function() {{
            acrontum.smoothScroll.resetFromSmoothScrollIDs().then(function() {
                //conditionally start the auto stoof
                if($('html, body').find('*[data-scroll]').length) {
                    acrontum.smoothScroll.start(acrontum.smoothScroll.variables.top, acrontum.smoothScroll.variables.idHolder);
                }
            });
        }});

        //start manually
        // acrontum.smoothScroll.start(configuration.top, configuration.idHolder);
    },

    /**
     * Sets the acrontum.smoothScroll.variables  based on a data-scroll-config
     */
    setConfiguration: function() {
        return new Promise(function(resolve, reject) {
            var $config;
            var cbucket = $('*[data-scroll-config]').first();
            if(cbucket.length) {
                $config = cbucket.data('scroll-config');
                if($config.length > 1) {
                    var config = JSON.parse($config);
                    Object.keys(config).forEach(function(i) {
                        acrontum.smoothScroll.variables[i] = config[i];
                    });
                }
            }
            resolve();
        });
    },

    /**
     * Reset the attribute data-smoothscroll-id to id.
     * This means the site can be passed a achor link the url.. eg blogs etc
     */
    resetFromSmoothScrollIDs: function() {
        return new Promise(function(resolve, reject) {
            $('*[data-smoothscroll-id]').each(function(i) {
                $(this).attr('id', $(this).data('smoothscroll-id'));
            }).promise().done(function() {
                resolve();
            });
        });
    },

    /**
     * start the whole process and register all events
     * @param  object top      $('.something')
     * @param  string idHolder the element that usually holds the ids you want to scroll to eg. 'section'
     * @return void
     */
    start: function(top, idHolder) {
        acrontum.smoothScroll.variables.idHolder = idHolder;
        acrontum.smoothScroll.variables.top = top;
        $(window).on('popstate', acrontum.smoothScroll.popstateHandler);
        $elements = $('html, body').find('*[data-scroll]');
        $elements.each(function(i) {
            var id = $(this).closest(acrontum.smoothScroll.variables.idHolder + '[id]').attr('id');
            $("a[href='#" + id + "']").on('click', acrontum.smoothScroll.clickHandler);
        });
        if($elements.length) {
            acrontum.smoothScroll.variables.ignoreNextPopChange = false;
        }
    },

    /**
     * what happens when the user presses the back-button in his browser: this function will be called
     * @param  Event e given by jQuery
     * @return void
     */
    popstateHandler: function(e) {
        if(acrontum.smoothScroll.variables.ignoreNextPopChange == false) {
            var hash = window.location.hash;
            if(history.pushState) {
                if(hash) {
                    if($(hash).length == 0) {
                        acrontum.smoothScroll.scroll(e.originalEvent.state.element, false);
                    } else {
                        acrontum.smoothScroll.scroll($(hash), false);
                    }
                } else {
                    acrontum.smoothScroll.scroll(acrontum.smoothScroll.variables.top);
                }
            } else {
                var state = acrontum.smoothScroll.variables.stateCollection.pop();
                var uid = hash.substr(1);
                if(typeof state !== 'undefined' && uid == state.uid) {
                    acrontum.smoothScroll.scroll(state.element, false);
                } else {
                    acrontum.smoothScroll.scroll(acrontum.smoothScroll.variables.top);
                }
            }
        }
    },

    /**
     * the function that will be called if a link is clicked
     * @param  e given by jQuery
     * @return void
     */
    clickHandler: function(e) {
        if(e.preventDefault) e.preventDefault();
        else e.returnValue = false;
        var hash = this.hash;
        acrontum.smoothScroll.scroll(hash, true);
    },

    /**
     * scroll to a specific element in the page
     * @param  object/string   element  the element to scroll to
     * @param  boolean   setpath  do we want to alter the path in the browsers address-bar?
     * @param  Function callback call me back when you're ready
     * @return void
     */
    scroll: function(element, setpath, callback) {
        if(typeof element !== 'object') {
            element = $(element);
        }
        if(typeof element.find('[data-offset]').data('offset') !== 'undefined') {
            var offset = element.find('[data-offset]').data('offset');
            $('html, body').animate({scrollTop: element.offset().top - offset}, 500).promise().done(function() {
                if(setpath) {
                    acrontum.smoothScroll.setpath(element);
                }
            });
        } else {
            $('html, body').animate({scrollTop: element.offset().top}, 500).promise().done(function() {
                 if(setpath) {
                    acrontum.smoothScroll.setpath(element);
                }
            });
        }
        if(typeof callback === 'function') {
            callback();
        }
    },

    /**
     * alter the path in the browsers address-bar
     * @param  element where we are now
     * @return void
     */
    setpath: function(element) {
        var hadId = false,
            uid = acrontum.smoothScroll.uniqid(),
            oldHash = element.hash;
        if(history.pushState || !acrontum.smoothScroll.variables.dontUseHistory) {
            acrontum.smoothScroll.variables.ignoreNextPopChange = true;
            if(typeof element.hash === 'undefined') {
                history.pushState({uid: uid, element: element.selector}, '', window.location.pathname + '#' + uid);
            } else {
                history.pushState({uid: uid, element: element.selector}, '', window.location.pathname + element.hash);
            }
            acrontum.smoothScroll.variables.ignoreNextPopChange = false;
        } else {
            if(typeof element.attr('id') !== 'undefined') {
                element.removeAttr('id');
                hadId = true;
            }
            acrontum.smoothScroll.variables.ignoreNextPopChange = true;
            if(!hadId) {
                window.location.hash = '#' + uid;
            } else {
                window.location.hash = oldHash;
            }
            acrontum.smoothScroll.variables.stateCollection.push({uid: uid, element: element})
            if(hadId) {
                element.attr('id', oldHash.substr(1));
            }
            acrontum.smoothScroll.variables.ignoreNextPopChange = false;
        }
    },

    /**
     * Smooth scroll into view, basic use: acrontum.toolbox.scrollIntoView($('.something') );
     * @param objToScollTo
     * @param topOffsetFromTarget
     * @param scrollSpeed
     * @param callback
     */
    scrollIntoView: function( objToScollTo, topOffsetFromTarget, scrollSpeed, callback ){
        topOffsetFromTarget = topOffsetFromTarget || false;
        scrollSpeed = scrollSpeed || 500;
        //scroll obj into view
        var offset = $( objToScollTo ).offset();
        if( topOffsetFromTarget ){
            offset.top -= topOffsetFromTarget;
        }
        $('html, body').animate({
            scrollTop: offset.top
        }, scrollSpeed);
        if(callback){
            callback();
        }
    },

    /**
     * returns a unique id based millisecond time
     * @returns {number}
     */
    uniqid: function() {
        return (new Date()).getTime();
    }
};
acrontum.smoothScroll.init();

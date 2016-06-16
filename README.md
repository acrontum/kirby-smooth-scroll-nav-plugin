# acrontum smooth scroll nav

### Requirements

This plugin works with Kirby 2.30 and the jQuery javascript library.

## What it does

When used with your Kirby 2.30 installation, the javascript plugin will give your one pager theme a smooth scrolling ability from the nav bar that is automatically bound to the browsers pop-state. Jump down your one pager design from the header links in the nav bar, jump back to the last position with the browser back button.

## Installation

1. Drop this plugin folder (`acrontum-smooth-scroll-nav`) into your kirby imstallations plugin folder (`site/plugins`)
2. Include the javascript file at the base of the body tag, see the Kirby docs (https://getkirby.com/docs/developer-guide/plugins/assets):

    `http://{domain}/assets/plugins/acrontum-smooth-scroll-nav/assets/js/acrontum.smoothscroll.js`
3. An example one pageer layout control template might look like:
```
   <?php
   	foreach($pages->visible() as $section) {
   		?>
   		<section data-smoothscroll-id="<?=$section->slug();?>">
   		<?php
   			// Calls the according snippet to the template. Remember: Snippets that can't be found are just not displayed.
   			snippet($section->intendedTemplate(), array('page' => $section));
   			?>
   		</section>
   		<?php
   	}
   ?>
```
With all url's loading the same base template "default.php" which might look like:
```
<?php snippet('header') ?>

<?php snippet('onePager'); ?>

<?php snippet('footer') ?>
```

4. On the parent element of each snippet you are using as a section of your one pager layout add the html attribute 'data-scroll' eg:

    `<div id="service" data-scroll="" data-offset="100">`

Just ensure that each snippet template name has the same name as your blueprint, eg: 'slider.php'


5. Create a menu snippet which might look something along the lines of:
```
<?php foreach($pages->visible() as $p):
$structure = yaml(file_get_contents(kirby()->roots()->blueprints().DS.$p->intendedTemplate().'.yml'));
$pageCouldHaveChildren = ((isset($structure['pages']['template'])) && (count($structure['pages']['template']) >= 1));
?>
<ul class="nav navbar-nav">
    <?php if($pageCouldHaveChildren == $p->hasVisibleChildren()):?>
    <li<?php e($p->isOpen(), ' class="active"') ?>>
        <a href="#<?=$p->slug() ?>"><?php echo $p->title()->html() ?></a>
    </li>
    <?php endif ?>
</ul>
<?php endforeach ?>
```

6. Include the snippet and you are ready to go. After the page loads, the javascript will bind new on click events to each header element to smooth scroll to, as well as the smooth scroll back on use of the browser back and forward buttons.


## Configuration
You can alter the scroll to position of any snippet by simply adding the html attribute `data-offset="100"`.

## Copyright
Copyright 2016 acrontum GmbH

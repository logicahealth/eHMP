::: page-description
# Contexts #
Documents different Contexts.
:::

## Workspace ##
### Color Theme ###
Each workspace context can define it's own color theme that provides the user visual distinction between workspace contexts. To create a new theme, start by creating a new `theme.scss` under the appropriate workspace context directory. In the Sass file start off with a top level class selector that includes the context name followed by `-context`. Nested inside the selector you can include the built in context-theme mixin like so `@include context-theme()`.

The Sass mixin takes in 9 color variables. The order is as follows:
`$primary, $primary-dark, $primary-light, $primary-light-alt, $primary-lighter, $primary-lightest, $secondary, $secondary-light, $secondary-dark`

```Sass
$example-primary:                 #076F7D;
$example-primary-dark:            #05434B;
$example-primary-light:           #CAE0DA;
$example-primary-light-alt:       #E4EFEC;
$example-primary-lighter:         #E2F3F8;
$example-primary-lightest:        #F3F5F7;
$example-secondary:               #328443;
$example-secondary-light:         #E4EFEC;
$example-secondary-dark:          #256632;

.example-context {
    @include context-theme($example-primary,$example-primary-dark,$example-primary-light,$example-primary-light-alt,$example-primary-lighter,$example-primary-lightest,$example-secondary,$example-secondary-light,$example-secondary-dark,$example-grey-lightest);
}
```

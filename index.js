$(window).on('load', function(){  


    $.ajax({
            url: 'http://localhost:3000/productsJson',
            method: 'GET',
            dataType: 'JSON',
        })
        .then(products => {
            showProduct(products)
            addMoreProduct(event, products)
            lessProduct(event, products)
            toggleUnit(event, products)
        });
});



function showProduct(products) {
    products.map(product => createProductCard(product))
    loadMore()
}

function loadMore() {
    $(".products_section").slice(0, 3).show();

    let buttonLoadMore = $('<button/>', {
        text: 'Показать еще',
        class: 'btn-load-more',
        id: 'loadMore',
        css: {
            color: '#fff',
            backgroundColor: '#f90',
            height: '40px',
            'text-transform': 'uppercase',
            'text-align': 'center',
            border: 'none',
            'margin-left': '40%'
        },
        click: function (e) {
            e.preventDefault();
            $(".products_section:hidden").slice(0, 3).slideDown();
        }
    })
    $('.product__area').after(buttonLoadMore)
}


function createProductCard(product) {
    let source = document.getElementById("template").innerHTML;
    let template = Handlebars.compile(source);
    let container = $('.product__area')
    let unitProduct;

    (product.unitFull === 'штука') 
        ? unitProduct = 'поштучно'
        : unitProduct = 'упаковками';

    let assocProducts = product.assocProducts.split(';');
    assocProducts.pop()

    let productCode = product.code.replace(/00000/g, ''); 
     
    let point = calculateBonus(100, product.priceGold)
    let primaryImageUrl = product.primaryImageUrl.slice(0, -4); 
    let formatImg = product.primaryImageUrl.substr(primaryImageUrl.length - 0);
     
    let context = {
        unitProduct: unitProduct,
        assocProducts: assocProducts,
        productCode: productCode,
        point: point,
        primaryImageUrl: `https://${primaryImageUrl}_220x220_1${formatImg}`,
        product
    };

    priceToRub()
    let html = template(context);
    container.append(html)
}


function priceToRub() {
    Handlebars.registerHelper('toRub', function (aNumber) {
        return aNumber.toFixed(2)
    })
}


function addMoreProduct(event, products) {
    $('.up').on('click', (event) => {
        let target = $(event.target);
        let stepper = target.closest(".products_section").find('.stepper-input');
        let count = stepper.val()
        count++
        stepper.val(`${count}`);

        countPriceForUnit(target, products, count)
    });
}


function counterPrice(event, priceClass, price, count) {
    return $(event.target).closest(".products_section")
            .find(`.${priceClass}`)
            .text((price * count)
            .toFixed(2))
}

function countPriceForUnit(target, products, count) {
    let unit = $(target).closest(".products_section").find('.unit--active').children().text()
    let cartId = $(target).closest(".products_section").attr('id').slice(18, -1)

    products.forEach(product => {
        if (product.productId === cartId) {
            if (unit === 'За м. кв.') {
                let goldPriceAlt = product.priceGoldAlt;
                let retailPriceAlt = product.priceRetailAlt;

                return (counterPrice(event, 'goldPrice', goldPriceAlt, count),
                        counterPrice(event, 'retailPrice', retailPriceAlt, count));

            } else {
                let goldPrice = product.priceGold;
                let retailPrice = product.priceRetail;

                return (counterPrice(event, 'goldPrice', goldPrice, count),
                        counterPrice(event, 'retailPrice', retailPrice, count));
            }
        }
    })
}

function lessProduct(event, products) {
    $('.down').on('click', (event) => {
        let target = $(event.target);
        let count = target.closest(".products_section").find('.stepper-input').val()
        count--
        (count <= 1) 
        ? $(target).closest(".products_section").find('.stepper-input').val(`1`)
        : $(target).closest(".products_section").find('.stepper-input').val(`${count}`);

        countPriceForUnit(target, products, count)
    });
}




function toggleUnit(event, products) {
    $('.unit--select').children().on('click', (event) => {
        toggleClassUnit(event)
        let cartId = $(event.target).closest(".products_section").attr('id').slice(18, -1)

        products.forEach(product => {
            if (product.productId === cartId) {
                showPriceForUnit(event, product)
            }
        })
    });
}

function toggleClassUnit(event) {
    $(event.target).closest('.unit--wrapper').find('.unit--select').removeClass('unit--active')
    $(event.target).parent().addClass('unit--active')
    $(event.target).closest('.products_section').find('.product__count').val('1')
}

function showPriceForUnit(event,product) {
    let unit = $(event.target).text()
    let unitPlace = $(event.target).closest(".products_section");

    if (unit === 'За м. кв.') {
        unitPlace.find('.goldPrice').text(product.priceGoldAlt.toFixed(2)) 
        unitPlace.closest(".products_section").find('.retailPrice').text(product.priceRetailAlt.toFixed(2)) 
    } else {
        unitPlace.find('.goldPrice').text(product.priceGold.toFixed(2)) 
        unitPlace.find('.retailPrice').text(product.priceRetail.toFixed(2)) 
    }
}

function calculateBonus(min, max) {
    let rand = min + Math.random() * (max - min);
    return rand.toFixed(2)
}
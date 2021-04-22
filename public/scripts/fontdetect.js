(function (root) {

    /**
     * JavaScript code to detect available availability of a
     * particular font in a browser using JavaScript and CSS.
     *
     * Author : Lalit Patel
     * Website: http://www.lalit.org/lab/javascript-css-font-detect/
     * License: Apache Software License 2.0
     *          http://www.apache.org/licenses/LICENSE-2.0
     * Version: 0.15 (21 Sep 2009)
     *          Changed comparision font to default from sans-default-default,
     *          as in FF3.0 font of child element didn't fallback
     *          to parent element if the font is missing.
     * Version: 0.2 (04 Mar 2012)
     *          Comparing font against all the 3 generic font families ie,
     *          'monospace', 'sans-serif' and 'sans'. If it doesn't match all 3
     *          then that font is 100% not available in the system
     * Version: 0.3 (24 Mar 2012)
     *          Replaced sans with serif in the list of baseFonts
     */

    /**
     * Usage: d = new Detector();
     *        d.detect('font name');
     */
    var Detector = function () {
        // a font will be compared against all the three default fonts.
        // and if it doesn't match all 3 then that font is not available.
        var baseFonts = ['monospace', 'sans-serif', 'serif'];

        //we use m or w because these two characters take up the maximum width.
        // And we use a LLi so that the same matching fonts can get separated
        var testString = "mmmmmmmmmmlli";

        //we test using 72px font size, we may use any size. I guess larger the better.
        var testSize = '72px';

        var h = document.getElementsByTagName("body")[0];

        // create a SPAN in the document to get the width of the text we use to test
        var s = document.createElement("span");
        s.style.fontSize = testSize;
        s.innerHTML = testString;
        var defaultWidth = {};
        var defaultHeight = {};
        for (var index in baseFonts) {
            //get the default width for the three base fonts
            s.style.fontFamily = baseFonts[index];
            h.appendChild(s);
            defaultWidth[baseFonts[index]] = s.offsetWidth; //width for the default font
            defaultHeight[baseFonts[index]] = s.offsetHeight; //height for the defualt font
            h.removeChild(s);
        }

        function detect(font) {
            var detected = false;
            for (var index in baseFonts) {
                s.style.fontFamily = font + ',' + baseFonts[index]; // name of the font along with the base font for fallback.
                h.appendChild(s);
                var matched = (s.offsetWidth != defaultWidth[baseFonts[index]] || s.offsetHeight != defaultHeight[baseFonts[index]]);
                h.removeChild(s);
                detected = detected || matched;
            }
            return detected;
        }

        this.detect = detect;
    };



    var testFontsList = "Agency FB|Aldhabi|Algerian|Andalus|Arabic Typesetting|Arial|Arial Black|Arial Narrow|Arial Rounded MT Bold|Arial Unicode MS|Baskerville Old Face|Bauhaus 93|Bell MT|Berlin Sans FB|Berlin Sans FB Demi|Bernard MT Condensed|Bitstream Vera Sans Mono|Blackadder ITC|Bodoni MT|Bodoni MT Black|Bodoni MT Condensed|Bodoni MT Poster Compressed|Book Antiqua|Bookman Old Style|Bookshelf Symbol 7|Bradley Hand ITC|Britannic Bold|Broadway|Brush Script MT|Buxton Sketch|Calibri|Calibri Light|Californian FB|Calisto MT|Cambria|Cambria Math|Candara|Castellar|Centaur|Century|Century Gothic|Century Schoolbook|Chiller|Colonna MT|Comic Sans MS|Consolas|Constantia|Cooper Black|Copperplate Gothic Bold|Copperplate Gothic Light|Corbel|Courier New|Curlz MT|DengXian|Ebrima|Edwardian Script ITC|Elephant|Engravers MT|Eras Bold ITC|Eras Demi ITC|Eras Light ITC|Eras Medium ITC|Felix Titling|Footlight MT Light|Forte|Franklin Gothic Book|Franklin Gothic Demi|Franklin Gothic Demi Cond|Franklin Gothic Heavy|Franklin Gothic Medium|Franklin Gothic Medium Cond|Freestyle Script|French Script MT|Gabriola|Gadugi|Garamond|Georgia|Gigi|Gill Sans MT|Gill Sans MT Condensed|Gill Sans MT Ext Condensed Bold|Gill Sans Ultra Bold|Gill Sans Ultra Bold Condensed|Gloucester MT Extra Condensed|Goudy Old Style|Goudy Stout|Haettenschweiler|Harlow Solid Italic|Harrington|High Tower Text|Impact|Imprint MT Shadow|Informal Roman|Javanese Text|Jokerman|Juice ITC|Kristen ITC|Kunstler Script|Leelawadee UI|Leelawadee UI Semilight|Lucida Bright|Lucida Calligraphy|Lucida Console|Lucida Fax|Lucida Handwriting|Lucida Sans|Lucida Sans Typewriter|Lucida Sans Unicode|Magneto|Maiandra GD|Malgun Gothic|Malgun Gothic Semilight|Marlett|Matura MT Script Capitals|Microsoft Himalaya|Microsoft JhengHei|Microsoft JhengHei Light|Microsoft JhengHei UI|Microsoft JhengHei UI Light|Microsoft MHei|Microsoft NeoGothic|Microsoft New Tai Lue|Microsoft PhagsPa|Microsoft Sans Serif|Microsoft Tai Le|Microsoft Uighur|Microsoft YaHei|Microsoft YaHei Light|Microsoft YaHei UI|Microsoft YaHei UI Light|Microsoft Yi Baiti|MingLiU-ExtB|MingLiU_HKSCS-ExtB|Mistral|Modern No. 20|Mongolian Baiti|Monotype Corsiva|MS Outlook|MS Reference Sans Serif|MS Reference Specialty|MT Extra|MV Boli|Myanmar Text|Niagara Engraved|Niagara Solid|Nirmala UI|Nirmala UI Semilight|NSimSun|OCR A Extended|Old English Text MT|Onyx|Palace Script MT|Palatino Linotype|Papyrus|Parchment|Perpetua|Perpetua Titling MT|Playbill|PMingLiU-ExtB|Poor Richard|Pristina|Rage Italic|Ravie|Rockwell|Rockwell Condensed|Rockwell Extra Bold|Sakkal Majalla|Script MT Bold|Segoe Marker|Segoe MDL2 Assets|Segoe Print|Segoe Script|Segoe UI|Segoe UI Black|Segoe UI Emoji|Segoe UI Historic|Segoe UI Light|Segoe UI Semibold|Segoe UI Semilight|Segoe UI Symbol|Segoe WP|Segoe WP Black|Segoe WP Light|Segoe WP Semibold|Segoe WP SemiLight|Showcard Gothic|Simplified Arabic|Simplified Arabic Fixed|SimSun|SimSun-ExtB|Sitka Banner|Sitka Display|Sitka Heading|Sitka Small|Sitka Subheading|Sitka Text|SketchFlow Print|Snap ITC|Stencil|Sylfaen|Symbol|Tahoma|TeamViewer10|Tempus Sans ITC|Times New Roman|Traditional Arabic|Trebuchet MS|Tw Cen MT|Tw Cen MT Condensed|Tw Cen MT Condensed Extra Bold|Urdu Typesetting|Verdana|Viner Hand ITC|Vivaldi|Vladimir Script|Webdings|Wide Latin|Wingdings|Wingdings 2|Wingdings 3|Yu Gothic|Yu Gothic Light|Yu Gothic Medium|Yu Gothic UI|Yu Gothic UI Light|Yu Gothic UI Semibold|Yu Gothic UI Semilight|'Indie Flower', cursive|'Dosis', sans-serif|'Yanone Kaffeesatz', sans-serif|'Fjalla One', sans-serif|'Alegreya Sans', sans-serif|'Inconsolata',|'Shadows Into Light', cursive|'Play', sans-serif|'Ruda', sans-serif";

    root.getInstalledFonts = function () {
        var list = testFontsList.split('|');
        var result = [];
        var detective = new Detector();

        list.forEach(function (f) {
            if (detective.detect(f))
                result.push(f);
        });

        return result;
    }

    $(document).ready(function () {
        root.fontsList = root.getInstalledFonts();
    });


})(this)

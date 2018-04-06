var recherches=[];//tableau contenant des chaines de caracteres correspondant aux recherches stockees
var recherche_courante;// chaine de caracteres correspondant a la recherche courante
var recherche_courante_news=[]; // tableau d'objets de type resultats (avec titre, date et url)

function ajouter_recherche()
{
	if (recherches.indexOf($('#zone_saisie').val()) == -1){
		recherches.push($('#zone_saisie').val());
		$('#recherches-stockees').append('<p class="titre-recherche"><label>'+$('#zone_saisie').val()+'</label><img src="croix30.jpg" class="icone-croix"/> </p>');

			$('.titre-recherche > label').attr('onclick','selectionner_recherche(this)');
			$('.titre-recherche > img').attr('onclick','supprimer_recherche(this)');

			//insertion des cookies
			var txt = JSON.stringify(recherches);

			//Pour empêcgher l'encodage du cookie
			$.cookie.raw = true;
			$.cookie("recherches",txt,{expires:1000});
			//crée un cookie de nom recherches expirant dans 1000 jours
	}

}

function supprimer_recherche(e)
{
	//e est l'img
	//il faut recup le pere
	//on vérifie que ce soit bien une image
	var parent = e.parentNode;
	var gdParent = parent.parentNode;
	var value = parent.firstChild.textContent;
	//puis le pere de celui ci pour ensuite supp son fils

	recherches.splice(recherches.indexOf(value),1);
	gdParent.removeChild(parent);

	var txt = JSON.stringify(recherches);
	$.cookie.raw = true;
	$.cookie("recherches",txt,{expires:8});
}


function selectionner_recherche(e)
{
	$("#resultats").empty();
	var ctnu = e.firstElementChild.innerHTML;
	$('#zone_saisie').val(ctnu);
	recherche_courante = ctnu;
	$.cookie.raw = true;
	//pour eviter les bugs de chargement on effectue le test suivant et on renvoie une alerte
	if ($.cookie(ctnu)==null){
		alert("Vous n'avez pas de nouvelle enregistrée pour cette recherche");
	}
	recherche_courante_news = JSON.parse($.cookie(ctnu));

//on parcourt les cookies et on crée les span pour afficher les nouvelles enregistrées
//on passe par un $.each car cela permet de boucler sur chaque élément
	$.each(recherche_courante_news, function(i,object){
		titre = decodeHtmlEntity(object.titre);
		url = object.url;
		date = object.date;		//pas besoin de formater car on a déjà formaté pendant l'enregistrement dans le cookie.

		var p = document.createElement("p");
		p.class="titre_result";
		p.innerHTML = "<a class=\"titre_news\" href=\"" + url + "\" target=\"_blank\">" + titre + "</a><span class=\"date_news\">" + date + "</span><span class=\"action_news\" onclick=\"supprimer_nouvelle(this)\"><img src=\"disk15.jpg\"/></span>";
		$("#resultats").append(p);

	});

}



function init()
{

	if (getCookie("recherches") != ""){
		recherches = JSON.parse(getCookie("recherches"));

		//on charge les recherches que l'on a enregistrées dans les cookies
		for (var i = 0; i < recherches.length; i++) {
			$('#recherches-stockees').append('<p class="titre-recherche" onclick="selectionner_recherche(this)"><label>'+recherches[i]+'</label><img src="croix30.jpg" class="icone-croix" onclick="supprimer_recherche(this)"/> </p>')
		}
	}
}


function ajax_get_request(callback,url,async){
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function(){
    if ((xhr.readyState==4) && (xhr.status==200)){
      callback(xhr.responseText);
    }
  };
  xhr.open("GET",url,async);
  xhr.send();
}

function rechercher_nouvelles()
{
	$("#resultats").empty();
	$("#wait").css('display','block');
	var data = $("#zone_saisie").val();
	ajax_get_request(maj_resultats,"search.php?data="+data,true);

}

function addResultat(res, opt = false) {
    var html = `
    <p class="titre_result">
            <a class="titre_news" href="${res.url}" target="_blank">${res.titre}</a>
            <span class="date_news">${format(res.date)}</span>
            <span class="action_news" onclick="${opt ? "supprimer_nouvelle(this)" : "sauver_nouvelle(this)"}">
                <img src="${opt ? "disk15" : "horloge15.jpg"}"/>
            </span>
    </p>
    `;

    $('#resultats').append(html);
}

function maj_resultats(res)
{
	$("#wait").css('display','none');

	var resultat = JSON.parse(res);
	var url,titre,date,balise;

	$.each(resultat, function(i,object){
		titre = decodeHtmlEntity(object.titre);
		url = object.url;
		date = format(object.date);

		var p = document.createElement("p");
		p.class="titre_result";
		p.innerHTML = "<a class=\"titre_news\" href=\"" + url + "\" target=\"_blank\">" + titre + "</a><span class=\"date_news\">" + date + "</span><span class=\"action_news\" onclick=\"sauver_nouvelle(this)\"><img src=\"horloge15.jpg\"/></span>";
		$("#resultats").append(p);

	});
}


function sauver_nouvelle(e)
{
	recherche_courante = $("#zone_saisie").val();
	$(e.firstChild).attr("src","disk15.jpg");
	$(e).attr("onclick","supprimer_nouvelle(this)");

	//on recupere les donnees du span du resultat d'une recherche
	var url = $(e.parentNode).find("a").attr("href");
	var titre = $(e.parentNode).find(".titre_news").text();
	var date = $(e.parentNode).find(".date_news").text();
	var obj ={url,titre,date};
	recherche_courante_news.push(obj);

	if (recherches.indexOf(recherche_courante)==-1) {
		ajouter_recherche(recherche_courante);
	}


	var txt = JSON.stringify(recherche_courante_news);
	$.cookie.raw = true;
	//alert("recherche_courante : " + recherche_courante);
	$.cookie($("#zone_saisie").val(),txt,{expires:1000});


}

//on crée un constructeur car quand on créait un objet avec Object ça fait une String
function objetNews(url,titre,date){
	this.url=url;
	this.titre=titre;
	this.date=date;
}

function supprimer_nouvelle(e)
{
	$(e.firstChild).attr("src","horloge15.jpg");
	$(e).attr("onclick","sauver_nouvelle(this)");

	var url = $(e.parentNode).find("a").attr("href");
	var titre = $(e.parentNode).find("a").html();
	var date = $(e.parentNode).find(".date_news").html();
	var obj =new objetNews(url,titre,date);


	if (recherche_courante_news != null && indexOf(recherche_courante_news,obj)!=-1) {
		recherche_courante_news.splice(indexOf(recherche_courante_news,obj),1);
		$.cookie.raw = true;
		$.cookie(obj, JSON.stringify(recherche_courante_news, {expires : 1000}));
	} else {
		alert("Erreur de supression de la recherche");
	}

	var txt = JSON.stringify(recherche_courante_news);
	$.cookie.raw = true;
	$.cookie(recherche_courante,txt,{expires:1000});
}

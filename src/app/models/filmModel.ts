export interface Leinwand {
    leinwand_name: string;
    leinwand_highlights_css: string;
    vorstellungen: {
        belegung_ampel: string;
        belegung_ampel_text: string;
        tag_der_woche: string;
        uhrzeit: string;
        datum_uhrzeit: string;
        datum_uhrzeit_iso?: string;
        deaktiviert?: boolean;
        vorstellung_id?: string;
        href?: string;
    }[];
    theater_name: string;
    theater_ort_name: string;
    theater_ort_adresse: string;
    release_flags: any[];
    vorstellungen_anzahl_tage: Record<string, number>;
    hat_aktive_vorstellungen: boolean;
}

export interface Theater {
    theater_name: string;
    theater_system_id: string;
    theater_selektiert_css: string;
    theater_system_sortierung: string;
    theater_ort_name: string;
    theater_ort_adresse: string;
    leinwaende: Leinwand[];
    vorstellungen_anzahl_tage: Record<string, number>;
}

export interface Film {
    system_id: string;
    film_hauptfilm: string;
    film_ist_ov: string;
    film_neu?: string;
    film_titel: string;
    film_beschreibung: string;
    film_wochentage: {
        tag_der_woche: string;
        tag_text: string;
        tag_datum: string;
    }[];
    theater: Theater[];
    film_system_id: string;
    film_favored: string;
    filminfo_href: string;
    film_cover_src: string;
    film_vorverkauf_zeit_nicht_erreicht?: string;
    vorstellungen_anzahl_tage: Record<string, number>;
    vorstellungen_anzahl_tage_max?: number;
}


export interface newFilm {
    film_id: string;
    film_titel: string;
    film_kurztitel: string;
    film_haupttitel: string;
    film_untertitel: string;
    film_original_titel: string;
    film_schlagzeile: string;
    film_kurztext: string;
    film_teasertext: string;
    film_synopsis: string;
    film_moviedb_id: string;
    film_edis: string;
    film_poster: string;
    film_bundesstart_datum: string;
    film_centerstart_zeit: string;
    film_vorverkauf_zeit: string;
    film_bearbeitet: string;
    film_dauer: string;
    film_fsk: string;
    film_jahr: string;
    film_website: string;
    film_produktionslaender: string;
    film_original_sprache: string;
    film_distributoren: string;
    film_studios: string;
    film_publisher: string;
    film_chartplatzierung_min: string;
    film_chartplatzierung_max: string;
    film_daten_sprache: string;
    film_ist_ov: string;
    film_hauptfilm: string;
    film_ist_archiviert: string;
    film_ist_geloescht: string;
    system_id: string;
    system_system_id: string;
    system_knoten_links: string;
    system_knoten_rechts: string;
    system_rechte_system_id: string;
    system_modul_id: string;
    system_klasse: string;
    system_trennung: string;
    system_fremd_id: string;
    system_root_system_id: string;
    system_name: string;
    system_sortierung: string;
    system_start_datum: string;
    system_ende_datum: string;
    system_status: string;
    system_flags: string;
    system_arbeitskopie_system_id: string;
    system_kategorien_system_id: string;
    system_erstell_login_id: string;
    system_erstell_datum: string;
    system_bearbeit_login_id: string;
    system_bearbeit_datum: string;
    system_wochentage: string;
    bild_id: string;
    bild_kategorie_id: string;
    bild_name: string;
    bild_format: string;
    bild_pfad_bild: string;
    bild_datum: string;
    bild_beschreibung: string;
    bild_ist_standard: string;
    bild_download_pfad: string;
    bild_download_zeit: string;
    bild_extern_id: string;
    bild_referenz_id: string;
    bild_typ_id: string;
    filmchart_id: null | string;
    filmchart_film: null | string;
    filmchart_platzierung_aktuell: null | string;
    filmchart_verkaufszahlen_aktuell: null | string;
    filmchart_platzierung_vorwoche: null | string;
    filmchart_verkaufszahlen_vorwoche: null | string;
    film_cover_src: string;
    film_system_id: string;
    film_favored: string;
    filminfo_href: string;
    film_beschreibung: string;
}



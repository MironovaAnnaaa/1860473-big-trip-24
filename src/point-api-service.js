import ApiService from './framework/api-service.js';

const Method = {
  GET : 'GET',
  PUT: 'PUT',
}

export default class PointsApiService extends ApiService{

  get points(){
    return this._load({url: 'points'}).then(ApiService.parseResponse);
  }

  get destinations(){
    return this._load({url: 'destinations'}).then(ApiService.parseResponse);
  }

  get offers(){
    return this._load({url: 'offers'}).then(ApiService.parseResponse);
  }

  async updatePoint(point){
    console.log(this.#adaptToServer(point));
    const response = await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const parsedResponse = await ApiService.parseResponse(response);
    console.log(parsedResponse);
    return parsedResponse;

  }


  #adaptToServer(point) {
    const adaptedPoint = {...point,
      'base_price': Number(point.basePrice),
      'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : null, // На сервере дата хранится в ISO формате
      'date_to': point.dateTo instanceof Date ? point.dateTo.toISOString() : null, // На сервере дата хранится в ISO формате
      'is_favorite': point.isFavorite,
    };

    // Ненужные ключи мы удаляем
    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.isFavorite;

    return adaptedPoint;
  }

}

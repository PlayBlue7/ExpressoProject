import functions_framework
from google.cloud import firestore
import pandas as pd
from scipy.sparse.linalg import svds
import numpy as np


def getOrders(uuid):
    db = firestore.Client()
    # [START firestore_data_query]
    # Note: Use of CollectionRef stream() is prefered to get()
    docs = db.collection(u'Orders').where(u'customerUID', u'==', uuid).stream()

    orders = []
    for doc in docs:
        orders.append(doc.to_dict())
    print(orders)
    # [END firestore_data_query]


def getRestaurantOrders(ruid, muid):
    db = firestore.Client()
    # [START firestore_data_query]
    # Note: Use of CollectionRef stream() is prefered to get()
    docs = db.collection(u'Orders').where(
        u'restaurantUID', u'==', ruid).where(u'menuUID', u'==', muid).stream()

    orders = []
    for doc in docs:
        orders.append(doc.to_dict())
    print(orders)
    return orders
    # [END firestore_data_query]


def getMenuItems(muid):
    db = firestore.Client()
    # [START firestore_data_query]
    doc_ref = db.collection(u'Menus').document(muid)

    doc = doc_ref.get()
    items = []
    if doc.exists:
        print(f'{doc.to_dict()}')
        data = doc.to_dict()
        for section in data['sections']:
            for item in section['items']:
                items.append(item)
    else:
        print(u'Menu does not exist!')
    return items

    # [END firestore_data_query]


#  item based collaborative filter (uses user's previous order history)
def collaborative_filter(user_id, restaurantOrders, menu):
    items = []
    items_no_photos = []

    for section in menu['sections']:
        for item in section['items']:
            temp = item.copy()
            items.append(temp.copy())
            temp.pop('photo')
            items_no_photos.append(temp)

    customerProductList = []
    for order in restaurantOrders:
        for item in order['items']:
            temp = item.copy()
            temp.pop('photo')
            customerProductList.append(
                [order['customerUID'], items_no_photos.index(temp), order['rating']])

    df = pd.DataFrame(customerProductList, columns=['cuid', 'item', 'rating'])

    ratings_matrix = pd.pivot_table(
        df, index=['cuid'], columns='item', values="rating")
    ratings_matrix.fillna(0, inplace=True)
    uids = []
    for index, row in ratings_matrix.iterrows():
        uids.append(index)
    ratings_matrix['user_index'] = np.arange(0, ratings_matrix.shape[0], 1)
    ratings_matrix.set_index(['user_index'], inplace=True)
    print()
    print(ratings_matrix.head())
    print()

    np_ratings = ratings_matrix.to_numpy()

    # Singular Value Decomposition
    # must satisfy 0 < k < min(n,m)
    U, sigma, Vt = svds(np_ratings, k=min(len(uids), len(items))//2)
    # Construct diagonal array in SVD
    sigma = np.diag(sigma)

    all_user_predicted_ratings = np.dot(np.dot(U, sigma), Vt)

    # Predicted ratings
    preds_df = pd.DataFrame(all_user_predicted_ratings,
                            columns=ratings_matrix.columns)
    print(preds_df)

    if (user_id not in uids):  # user has not ordered at this restaurant before (cold start problem)
        return popularity_recommend(user_id, restaurantOrders, menu)
    user_idx = uids.index(user_id)  # index starts at 0

    # Get and sort the user's ratings
    sorted_user_ratings = ratings_matrix.iloc[user_idx].sort_values(
        ascending=False)
    # sorted_user_ratings
    sorted_user_predictions = preds_df.iloc[user_idx].sort_values(
        ascending=False)
    # sorted_user_predictions

    # recommendations that the user has already had
    existing = pd.concat(
        [sorted_user_ratings, sorted_user_predictions], axis=1)
    existing.index.name = 'Previously Ordered Items'
    existing.columns = ['user_ratings', 'user_predictions']

    # introduces novelty into recommendations
    new_recommendations = existing.loc[existing.user_ratings == 0]
    new_recommendations = new_recommendations.sort_values(
        'user_predictions', ascending=False)
    new_recommendations.index.name = 'New Items'
    print('\nBelow are the recommended items for user(user_id = {}):\n'.format(user_idx))

    item_indexes = []
    for index, row in existing.head(2).iterrows():
        item_indexes.append(index)
    for index, row in new_recommendations.head(3).iterrows():
        item_indexes.append(index)
    print(existing.head(2))
    print(new_recommendations.head(5))
    print(item_indexes)

    return [items[i] for i in item_indexes]  # will be at most 5


# non-personalised popularity based model
def popularity_recommend(user_id, restaurantOrders, menu):
    items = []
    items_no_photos = []

    for section in menu['sections']:
        for item in section['items']:
            temp = item.copy()
            items.append(temp.copy())
            temp.pop('photo')
            items_no_photos.append(temp)

    customerProductList = []
    for order in restaurantOrders:
        for item in order['items']:
            temp = item.copy()
            temp.pop('photo')
            customerProductList.append(
                [order['customerUID'], items_no_photos.index(temp), order['rating']])

    df = pd.DataFrame(customerProductList, columns=['cuid', 'item', 'rating'])

    ratings_matrix = pd.pivot_table(
        df, index=['cuid'], columns='item', values="rating")
    ratings_matrix.fillna(0, inplace=True)
    print()
    print(ratings_matrix)
    print()

    grouped = df.groupby('item').agg({'cuid': 'count'}).reset_index()
    grouped.rename(columns={'cuid': 'score'}, inplace=True)

    sorted = grouped.sort_values(
        ['score', 'item'], ascending=[0, 1])

    # Generate a recommendation rank based upon score
    sorted['rank'] = sorted['score'].rank(
        ascending=0, method='first')

    topfive = sorted.head(5).copy()
    topfive['cuid'] = user_id  # add new column with customer id

    # Make cuid column the first column
    cols = topfive.columns.tolist()
    cols = cols[-1:] + cols[:-1]
    topfive = topfive[cols]
    print(topfive)
    print()
    item_indexes = list(topfive['item'])
    print(item_indexes)
    print()

    return [items[i] for i in item_indexes]  # will be at most 5


@functions_framework.http
def getRecommendations(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`
        <https://flask.palletsprojects.com/en/1.1.x/api/#flask.make_response>.
    """

    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and 'uuid' in request_json:
        uuid = request_json['uuid']
    elif request_args and 'uuid' in request_args:
        uuid = request_args['uuid']
    else:
        uuid = ''

    if request_json and 'ruid' in request_json:
        ruid = request_json['ruid']
    elif request_args and 'ruid' in request_args:
        ruid = request_args['ruid']
    else:
        ruid = ''

    if request_json and 'muid' in request_json:
        muid = request_json['muid']
    elif request_args and 'muid' in request_args:
        muid = request_args['muid']
    else:
        muid = ''

    print(uuid)
    print(ruid)
    print(muid)

    items = []
    restaurantOrders = []

    if uuid != '':
        getOrders(uuid)
    if muid != '':
        items = getMenuItems(muid)
        if ruid != '':
            restaurantOrders = getRestaurantOrders(ruid, muid)

    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    # we try a collaborative filter first, then if we find the data is sparse for the user at that restaurant, use the popularity based metric
    recommendations = collaborative_filter(uuid, restaurantOrders, items)
    result = [item['name'] for item in recommendations]
    return (result, 200, headers)

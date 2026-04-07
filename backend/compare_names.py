import re
seed_main = 'backend/seed_crops.js'
seed_pred = 'crop-price-prediction-module/backend/src/seeds/seed.js'

def extract_names(path):
    names=[]
    with open(path, encoding='utf-8') as f:
        txt=f.read()
    for m in re.finditer(r"name:\s*(['\"])(.*?)\1", txt):
        names.append(m.group(2))
    return names

main = extract_names(seed_main)
pred = extract_names(seed_pred)
print('main count', len(main))
print('pred count', len(pred))
main_set=set(main)
pred_set=set(pred)
print('missing in pred', sorted(main_set-pred_set))
print('missing in main', sorted(pred_set-main_set))

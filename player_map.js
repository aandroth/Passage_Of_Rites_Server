var m_playerDictionary = new Map();
    m_playerDictionary.set(0, -1);
    m_playerDictionary.set(1, -1);
    m_playerDictionary.set(2, -1);
    m_playerDictionary.set(3, -1);

var FindSpotInPlayerMap = () => {
    for (var i = 0; i < m_playerDictionary.Length; i++) {
        if (m_playerDictionary[i] == -1) {
            return i;
        }
    }
    return -1;
}
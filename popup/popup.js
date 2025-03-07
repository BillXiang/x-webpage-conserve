document.addEventListener('DOMContentLoaded', async function () {
    const saveButton = document.getElementById('saveButton');
    const configureGithubButton = document.getElementById('configureGithubButton');
    const modal = document.getElementById('myModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const confirmButton = document.getElementById('confirmButton');
    const filenameInput = document.getElementById('filenameInput');
    const githubConfigModal = document.getElementById('githubConfigModal');
    const closeGithubConfig = document.getElementById('closeGithubConfig');
    const saveGithubConfigButton = document.getElementById('saveGithubConfigButton');
    const githubTokenInput = document.getElementById('githubToken');
    const githubUsernameInput = document.getElementById('githubUsername');
    const githubRepoInput = document.getElementById('githubRepo');
    const githubBranchInput = document.getElementById('githubBranch');
    const saveOption = document.getElementById('saveOption');
    const openPageButton = document.getElementById('openPageButton');

    // 从本地存储中获取之前的 GitHub 配置信息
    const { githubConfig } = await browser.storage.local.get('githubConfig');
    if (githubConfig) {
        githubTokenInput.value = githubConfig.token;
        githubUsernameInput.value = githubConfig.username;
        githubRepoInput.value = githubConfig.repo;
        githubBranchInput.value = githubConfig.branch;
    }

    // 从本地存储中获取上次选择的保存位置
    const { lastSaveLocation } = await browser.storage.local.get('lastSaveLocation');
    if (lastSaveLocation) {
        saveOption.value = lastSaveLocation;
    }

    saveButton.addEventListener('click', async function () {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            const isPdf = activeTab.url.endsWith('.pdf');
            const filename = generateFilename(activeTab.title, isPdf);
            filenameInput.value = filename;
            modal.style.display = "block";
        }
    });

    closeBtn.onclick = function () {
        modal.style.display = "none";
    }

    // 为 select 元素添加 change 事件监听器
    saveOption.addEventListener('change', async function () {
        const saveTo = saveOption.value;
        // 保存本次选择的保存位置到本地存储
        await browser.storage.local.set({ lastSaveLocation: saveTo });
    });

    confirmButton.addEventListener('click', async function () {
        const userInput = filenameInput.value;
        if (userInput) {
            const githubConfig = {
                token: githubTokenInput.value,
                username: githubUsernameInput.value,
                repo: githubRepoInput.value,
                branch: githubBranchInput.value
            };
            const saveTo = saveOption.value;
            browser.runtime.sendMessage({ action: 'savePage', filename: userInput, githubConfig, saveTo }, async (response) => {
            });
            modal.style.display = "none";
        }
    });

    openPageButton.addEventListener('click', function () {
        // 获取扩展页面的 URL
        const pageUrl = browser.runtime.getURL('list.html');
        // 在新标签页中打开扩展页面
        browser.tabs.create({ url: pageUrl });
    });

    configureGithubButton.addEventListener('click', function () {
        githubConfigModal.style.display = "block";
    });

    closeGithubConfig.onclick = function () {
        githubConfigModal.style.display = "none";
    }

    saveGithubConfigButton.addEventListener('click', async function () {
        const githubConfig = {
            token: githubTokenInput.value,
            username: githubUsernameInput.value,
            repo: githubRepoInput.value,
            branch: githubBranchInput.value
        };
        // 将 GitHub 配置信息保存到本地存储
        await browser.storage.local.set({ githubConfig });
        githubConfigModal.style.display = "none";
    });
});

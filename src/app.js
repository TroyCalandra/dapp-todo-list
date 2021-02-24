App = {
    loading: false,
    contracts: {},
  
    load: async () => {
      // await App.loadWeb3();
      await App.loadContract();
      await App.loadAccount();
      await App.render();
    },

    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        console.log('hit')
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        console.log('hit')
        try {
          console.log(App.contracts.TodoList.address)
          const transactionHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [
              {
                to: App.contracts.TodoList.address,
                'from': App.account,
                value: 200,
                // And so on...
              },
            ],
          });
          // Handle the result
          console.log(transactionHash); 
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },

    loadAccount: async () => {
      // Set the current blockchain account
      accounts = await ethereum.request({ method: 'eth_accounts' });
      App.account = accounts[0];
      console.log(App.account)
    },

    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const todoList = await $.getJSON('TodoList.json')
      // const block = await web3.eth.getBlock('latest');
      App.contracts.TodoList = TruffleContract(todoList)
      App.contracts.TodoList.setProvider(window.ethereum)
      App.contracts.TodoList.defaults({from: App.account})

      // Hydrate the smart contract with values from the blockchain
      App.todoList = await App.contracts.TodoList.deployed()
      console.log(App.todoList)
    },

    createTask: async () => {
      App.setLoading(true)
      const content = $('#newTask').val()
      console.log('none')
      await App.todoList.createTask(content)
      console.log('pre')
      window.location.reload()
      console.log('end')
    },
  
    toggleCompleted: async (e) => {
      App.setLoading(true)
      const taskId = e.target.name
      await App.todoList.toggleCompleted(taskId)
      window.location.reload()
    },

    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    },

    renderTasks: async () => {
      // Load the total task count from the blockchain
      const taskCount = await App.todoList.taskCount()
      const $taskTemplate = $('.taskTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.tasks(i)
        const taskId = task[0].toNumber()
        const taskContent = task[1]
        const taskCompleted = task[2]
  
        // Create the html for the task
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.content').html(taskContent)
        $newTaskTemplate.find('input')
                        .prop('name', taskId)
                        .prop('checked', taskCompleted)
                        .on('click', App.toggleCompleted)
  
        // Put the task in the correct list
        if (taskCompleted) {
          $('#completedTaskList').append($newTaskTemplate)
        } else {
          $('#taskList').append($newTaskTemplate)
        }
  
        // Show the task
        $newTaskTemplate.show()
      }
    },

    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render Account
      $('#account').html(App.account)
  
      // Render Tasks
      await App.renderTasks()
  
      // Update loading state
      App.setLoading(false)
    },

  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })